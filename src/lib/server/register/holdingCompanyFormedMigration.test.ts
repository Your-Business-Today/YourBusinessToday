import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0253_holding_company_formed_only_when_young.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the migration that calls a holding company formed only when it was newly incorporated', () => {
	it('drops nothing and touches no table, column, row, index, policy or trigger', () => {
		expect(statements).not.toMatch(/drop (table|column|function|trigger|policy|index)/i);
		expect(statements).not.toMatch(/alter table|create table|create policy|create index|create (or replace )?trigger/i);
		expect(statements).not.toMatch(/update |insert into|delete from|truncate|grant |revoke /i);
	});

	it('replaces the one function, the holding company trigger, under the signature it has', () => {
		expect(statements.match(/create or replace function/g)).toHaveLength(1);
		expect(statements).toContain('create or replace function public.register_companies_flag_holding_companies()\nreturns trigger');
	});

	it('returns early for a company with no incorporation date or one older than the days that make a company new', () => {
		const earlyReturn =
			/if new\.incorporated_on is null or new\.incorporated_on < new\.last_seen_month - public\.register_new_company_days\(\) then\s+return new;\s+end if;\s+select \* into trading/;
		expect(statements).toMatch(earlyReturn);
	});

	it('asks its age only after the SIC test, and does not read the first-load test of register_loads', () => {
		const sicTest = statements.indexOf('public.holding_company_sic_codes()');
		const ageTest = statements.indexOf('public.register_new_company_days()');
		expect(sicTest).toBeGreaterThan(-1);
		expect(ageTest).toBeGreaterThan(sicTest);
		expect(statements).not.toContain('register_loads');
	});

	it('still writes the same line for a young holding company', () => {
		expect(statements).toContain("null, 'holding_company_over_trading', new.company_number, null, null");
		expect(statements).toContain("public.register_change_key('holding_company_over_trading', new), new.last_seen_month, null");
	});

	it('can be run twice, inside one transaction', () => {
		expect(statements.trim().startsWith('begin;')).toBe(true);
		expect(statements.trim().endsWith('commit;')).toBe(true);
	});
});
