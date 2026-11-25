import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { tablesKeptByOrganisation } from '$lib/server/organisationExport/tablesKeptByOrganisation';
import { BooksClosingTables, closedPartColumns } from './booksClosing';

const migration = readFileSync('migrations/0293_books_closed_months.sql', 'utf8');
const statements = migration.replace(/^--.*$/gm, '');

describe('migration 0293, the books closed to a month and each shared cost’s parts kept for the months closed', () => {
	it('holds every column the site reads, one part to a cost centre, account and month of a shared cost', () => {
		for (const column of closedPartColumns.split(', ')) expect(statements).toMatch(new RegExp(`\\n\\t${column} `));
		expect(statements).toContain('unique nulls not distinct (cost_share_id, month, account_id, cost_centre_id)');
		expect(statements).toContain('check (extract(day from closed_to_month) = 1)');
	});

	it('is read by the server alone and goes out with the organisation’s data', () => {
		for (const table of Object.values(BooksClosingTables)) {
			expect(statements).toContain(`alter table public.${table} enable row level security;`);
			expect(tablesKeptByOrganisation).toContain(table);
		}
		expect(statements).not.toMatch(/create policy/);
	});

	it('only adds: it drops no table or column, deletes or updates no row and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b/);
		expect(statements).not.toMatch(/\bdelete from\b/);
		expect(statements).not.toMatch(/\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '10s';");
	});
});
