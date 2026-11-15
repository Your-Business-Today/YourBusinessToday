import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0247_first_places_load_stays_out_of_the_feed.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const settingName = 'ybt.is_first_places_load';

describe("the migration that keeps a territory's first load of places out of the feed", () => {
	it('drops nothing and touches no table', () => {
		expect(statements).not.toMatch(/drop (table|column|function|trigger)/i);
		expect(statements).not.toMatch(/alter table|create table|delete from|truncate/i);
	});

	it('adds the upsert that is told whether the load is the first, with no default, so a call is told apart from the old one by its arguments', () => {
		expect(statements).toContain('create or replace function public.upsert_places(rows jsonb, seen_at timestamptz, is_first_load boolean)');
		expect(statements).not.toMatch(/is_first_load boolean default/i);
		expect(statements).not.toContain('function public.upsert_places(rows jsonb, seen_at timestamptz)');
	});

	it('sets the mark for the transaction of the one call, after checking who is calling', () => {
		const guard = statements.indexOf("raise exception 'Only the service role writes places'");
		const mark = statements.indexOf(`perform set_config('${settingName}', case when is_first_load then 'true' else 'false' end, true);`);
		const insert = statements.indexOf('insert into public.premises');
		expect(guard).toBeGreaterThan(0);
		expect(mark).toBeGreaterThan(guard);
		expect(insert).toBeGreaterThan(mark);
	});

	it('writes no arrival for a place while the mark is set, and still writes one for a food premises', () => {
		expect(statements).toContain(`is_first_places_load boolean := coalesce(current_setting('${settingName}', true), '') = 'true';`);
		const earlyReturn = /if tg_op = 'INSERT' then\s+if is_place and is_first_places_load then\s+return new;\s+end if;\s+perform public\.write_area_event/;
		expect(statements).toMatch(earlyReturn);
	});

	it('still announces a place that goes, whichever load marks it', () => {
		expect(statements).toMatch(/if new\.is_gone and not old\.is_gone then\s+perform public\.write_area_event\(new\.outcode, new\.sector, null, closed_kind/);
	});

	it('tells PostgREST of the new function', () => {
		expect(migration.trimEnd().endsWith("notify pgrst, 'reload schema';")).toBe(true);
	});
});
