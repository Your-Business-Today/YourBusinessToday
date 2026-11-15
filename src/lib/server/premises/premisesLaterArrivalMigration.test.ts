import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0251_premises_arrived_after_the_first_load.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the migration that marks the premises that arrived after the first load of their ground', () => {
	it('drops nothing and touches no policy, grant or other table', () => {
		expect(statements).not.toMatch(/drop (table|column|function|trigger|policy|index)/i);
		expect(statements).not.toMatch(/create table|create policy|insert into|delete from|truncate|grant |revoke /i);
		expect(statements.match(/alter table/g)).toHaveLength(1);
	});

	it('adds the one column, false until a premises is known to have arrived later', () => {
		expect(statements).toContain('alter table public.premises add column if not exists is_later_arrival boolean not null default false;');
	});

	it('settles the mark as a row is first written, so neither door is rewritten', () => {
		expect(statements).toMatch(/create or replace trigger premises_note_later_arrival\s+before insert on public\.premises\s+for each row/);
		expect(statements.match(/create or replace function/g)).toHaveLength(1);
		expect(statements).not.toMatch(/upsert_places|upsert_premises/);
	});

	it('makes a trading place a later arrival exactly when the feed is told it arrived, by the word of its load', () => {
		const wordOfTheLoad = "is_first_places_load boolean := coalesce(current_setting('ybt.is_first_places_load', true), '') = 'true';";
		expect(statements).toContain(wordOfTheLoad);
		expect(readFileSync('migrations/0247_first_places_load_stays_out_of_the_feed.sql', 'utf8')).toContain(wordOfTheLoad);
		expect(statements).toContain('new.is_later_arrival := not is_first_places_load;');
	});

	it('reads a food business by whether its ground was held when its authority was last swept to the end', () => {
		expect(statements).toContain('select swept_at into authority_swept_at from public.food_hygiene_authorities where code = new.authority_code;');
		expect(statements).toMatch(/held\.source = new\.source\s+and held\.authority_code = new\.authority_code\s+and held\.outcode = new\.outcode/);
		expect(statements).toContain('and held.first_seen_at <= authority_swept_at');
	});

	it('gives the question the trigger asks of every row an index of its own', () => {
		expect(statements).toContain('create index if not exists premises_by_ground on public.premises (source, authority_code, outcode, first_seen_at);');
	});

	it('settles the premises already held, a place by the feed and a food business by its ground, writing that column alone', () => {
		expect(statements.match(/update public\.premises as later\s+set is_later_arrival = true\s+from/g)).toHaveLength(2);
		expect(statements.match(/\sset /g)).toHaveLength(3);
		expect(statements).toContain("and later.source_id = split_part(announced.source_key, ':', 3)");
		expect(statements).toContain('and later.first_seen_at > first_sightings.first_seen_at');
	});

	it('can be run twice, inside one transaction, and tells PostgREST of the new column', () => {
		expect(statements.trim().startsWith('begin;')).toBe(true);
		expect(statements).toContain('and not later.is_later_arrival;\n\ncommit;');
		expect(migration.trimEnd().endsWith("notify pgrst, 'reload schema';")).toBe(true);
	});
});
