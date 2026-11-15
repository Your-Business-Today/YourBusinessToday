import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0246_postcodes_not_found.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');
const leavesOutThoseAskedLately = 'not_found.asked_at > now() - make_interval(days => public.days_before_a_postcode_is_asked_again())';

describe('the migration that remembers the postcodes the postcode service does not know', () => {
	it('creates one table of its own and drops nothing', () => {
		const created = [...statements.matchAll(/create table if not exists public\.(\w+)/g)].map((match) => match[1]);
		expect(created).toEqual(['postcodes_not_found']);
		expect(statements).not.toMatch(/drop (table|column|function|trigger)/i);
	});

	it('leaves a postcode asked about lately out of the list still to place and out of its count, so the two agree', () => {
		const leftOut = statements.split(leavesOutThoseAskedLately).length - 1;
		expect(leftOut).toBe(2);
		expect(statements.split('not_found.postcode is null').length - 1).toBe(2);
	});

	it('keeps the two functions under the signatures the site already calls', () => {
		expect(statements).toContain('create or replace function public.register_postcodes_to_geocode(page_size integer)');
		expect(statements).toContain('create or replace function public.count_register_postcodes_to_geocode()');
	});
});
