import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LoanBudgetLimits } from '$lib/data/books/loanBudget/loanBudget';
import { tablesKeptByOrganisation } from '$lib/server/organisationExport/tablesKeptByOrganisation';
import { LoanBudgetTables, loanBudgetColumns, loanBudgetLineColumns, loanDrawColumns } from './loanBudgetRecord';

const migration = readFileSync('migrations/0284_books_loan_budgets.sql', 'utf8');
const statements = migration.replace(/^--.*$/gm, '');
const everyTable = Object.values(LoanBudgetTables);

describe('migration 0284, the ring-fenced loan budgets, and the limits the connector checks', () => {
	it('holds the same lengths and range as the rules, with every column the site reads', () => {
		expect(statements).toContain(`check (char_length(title) between 1 and ${LoanBudgetLimits.longestTitle} and btrim(title) = title)`);
		expect(statements).toContain(`check (char_length(notes) <= ${LoanBudgetLimits.longestText})`);
		expect(statements).toContain(`check (repayment_months between 1 and ${LoanBudgetLimits.mostRepaymentMonths})`);
		const columns = [loanBudgetColumns, loanDrawColumns, loanBudgetLineColumns].flatMap((list) => list.split(', '));
		for (const column of columns) expect(statements).toMatch(new RegExp(`\\n\\t${column} `));
	});

	it('keeps who approved a line and when together, or neither', () => {
		expect(statements).toContain('check ((approved_by_name is null) = (approved_at is null))');
	});

	it('is read by the server alone and goes out with the organisation’s data', () => {
		for (const table of everyTable) {
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
		for (const table of everyTable) expect(statements).toContain(`create table if not exists public.${table}`);
	});
});
