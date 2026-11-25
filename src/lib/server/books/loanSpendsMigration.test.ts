import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LoanBudgetLimits } from '$lib/data/books/loanBudget/loanBudget';
import { tablesKeptByOrganisation } from '$lib/server/organisationExport/tablesKeptByOrganisation';
import { loanSpendColumns, loanSpendsTable } from './loanSpendRecord';

const migration = readFileSync('migrations/0285_books_loan_spends.sql', 'utf8');
const statements = migration.replace(/^--.*$/gm, '');

describe('migration 0285, the spends from a ring-fenced loan, and the limits the connector checks', () => {
	it('holds the same length as the rules, with every column the site reads', () => {
		expect(statements).toContain(`check (char_length(description) between 1 and ${LoanBudgetLimits.longestTitle} and btrim(description) = description)`);
		for (const column of loanSpendColumns.split(', ')) expect(statements).toMatch(new RegExp(`\\n\\t${column} `));
	});

	it('keeps each spend against a line of the same organisation', () => {
		expect(statements).toContain('references public.books_loan_budget_lines (organisation_id, id) on delete restrict');
	});

	it('is read by the server alone and goes out with the organisation’s data', () => {
		expect(statements).toContain(`alter table public.${loanSpendsTable} enable row level security;`);
		expect(tablesKeptByOrganisation).toContain(loanSpendsTable);
		expect(statements).not.toMatch(/create policy/);
	});

	it('only adds: it drops no table or column, deletes or updates no row and gives up on a lock in seconds', () => {
		expect(statements).not.toMatch(/\bdrop (table|column)\b/);
		expect(statements).not.toMatch(/\bdelete from\b/);
		expect(statements).not.toMatch(/\bupdate public\./);
		expect(statements).toContain("set local lock_timeout = '10s';");
		expect(statements).toContain(`create table if not exists public.${loanSpendsTable}`);
	});
});
