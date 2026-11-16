import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0250_patch_place_categories.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the migration that counts the categories of trading place a territory holds', () => {
	it('drops nothing and touches no table, column, row, index, policy or grant', () => {
		expect(statements).not.toMatch(/drop (table|column|function|trigger|policy|index)/i);
		expect(statements).not.toMatch(/alter table|create table|create policy|create index|update |insert into|delete from|truncate|grant |revoke /i);
	});

	it('adds the one function, which only reads and runs as its caller', () => {
		expect(statements).toContain('create or replace function public.patch_place_categories(target_patch_id uuid)');
		expect(statements).toMatch(/language sql\s+stable/);
		expect(statements).not.toMatch(/security definer/i);
	});

	it('counts the trading places still trading in the outcodes of the territory asked for', () => {
		expect(statements).toContain("where place.source = 'places_dataset' and not place.is_gone");
		expect(statements).toContain('on patch_outcode.outcode = place.outcode and patch_outcode.patch_id = target_patch_id');
		expect(statements).toContain("count(*) filter (where place.phone <> '') as with_phone_count");
	});

	it('can be run twice, inside one transaction', () => {
		expect(statements.match(/create or replace function/g)).toHaveLength(1);
		expect(statements.trim().startsWith('begin;')).toBe(true);
		expect(statements).toContain('commit;');
	});

	it('tells PostgREST of the new function', () => {
		expect(migration.trimEnd().endsWith("notify pgrst, 'reload schema';")).toBe(true);
	});
});
