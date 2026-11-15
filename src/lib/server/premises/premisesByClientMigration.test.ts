import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const migration = readFileSync('migrations/0249_premises_by_client.sql', 'utf8');
const statements = migration.replace(/--.*$/gm, '');

describe('the migration that lets a premises be found by the client made from it', () => {
	it('drops nothing and touches no table, column, row or policy', () => {
		expect(statements).not.toMatch(/drop (table|column|function|trigger|policy|index)/i);
		expect(statements).not.toMatch(/alter table|create table|create policy|update |insert into|delete from|truncate|grant |revoke /i);
	});

	it('adds the one index, on the client of the premises that are tied to one', () => {
		expect(statements).toContain('create index if not exists premises_by_client on public.premises (client_id) where client_id is not null;');
	});

	it('can be run twice, inside one transaction', () => {
		expect(statements.match(/create index/g)).toHaveLength(1);
		expect(statements.trim().startsWith('begin;')).toBe(true);
		expect(statements.trim().endsWith('commit;')).toBe(true);
	});
});
