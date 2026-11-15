import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0252_first_food_sweep_stays_out_of_the_feed.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe("the migration that keeps a territory's first food sweep out of the feed", () => {
	it('drops nothing and touches no table, column, row, index, policy or trigger', () => {
		expect(statements).not.toMatch(/drop (table|column|function|trigger|policy|index)/i);
		expect(statements).not.toMatch(/alter table|create table|create policy|create index|create (or replace )?trigger/i);
		expect(statements).not.toMatch(/update |insert into|delete from|truncate|grant |revoke /i);
	});

	it('replaces the one function, the premises trigger, under the signature it has', () => {
		expect(statements.match(/create or replace function/g)).toHaveLength(1);
		expect(statements).toContain('create or replace function public.premises_write_area_events()\nreturns trigger');
	});

	it('writes an arrival only for a premises that arrived after the first load of its ground, whatever its source', () => {
		const earlyReturn = /if tg_op = 'INSERT' then\s+if not new\.is_later_arrival then\s+return new;\s+end if;\s+perform public\.write_area_event\(new\.outcode, new\.sector, null, opened_kind/;
		expect(statements).toMatch(earlyReturn);
		expect(statements).not.toContain('is_first_places_load');
	});

	it('reads the mark the migration before it settles as a row is first written', () => {
		const markOfArrival = readFileSync('migrations/0251_premises_arrived_after_the_first_load.sql', 'utf8');
		expect(markOfArrival).toContain('add column if not exists is_later_arrival boolean not null default false');
		expect(markOfArrival).toMatch(/create or replace trigger premises_note_later_arrival\s+before insert on public\.premises/);
	});

	it('still announces a closure, a change of hands and a re-inspection', () => {
		expect(statements).toMatch(/if new\.is_gone and not old\.is_gone then\s+perform public\.write_area_event\(new\.outcode, new\.sector, null, closed_kind/);
		expect(statements).toContain("null, 'premises_changed_hands', ''");
		expect(statements).toContain("null, 'premises_reinspected', ''");
	});

	it('can be run twice, inside one transaction', () => {
		expect(statements.trim().startsWith('begin;')).toBe(true);
		expect(statements.trim().endsWith('commit;')).toBe(true);
	});
});
