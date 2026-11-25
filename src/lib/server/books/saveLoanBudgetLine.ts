import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoanBudgetLine, LoanBudgetLineSettings } from '$lib/data/books/loanBudget/loanBudget';
import { validateLoanBudgetLine, validateLoanBudgetLineChange } from '$lib/data/books/loanBudget/loanBudgetLineRules';
import { overBudgetRefusal } from '$lib/data/books/loanBudget/loanBudgetTotals';
import { belowSpentRefusal } from '$lib/data/books/loanBudget/loanLineSpending';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { LoanBudgetTables } from './loanBudgetRecord';
import { findLoanBudget, findLoanBudgetLine } from './loanBudgets';

/** A line as it stood before a change and as it reads after it, its approval taken off when what was approved changed. */
export type LoanBudgetLineCorrection = { before: LoanBudgetLine; after: LoanBudgetLine };

const noApproval = { approved_by_account_id: null, approved_by_name: null, approved_at: null };

/** Adds a line to a loan budget, awaiting a director's approval; the lines never come to more than the loan. */
export async function addLoanBudgetLine(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<LoanBudgetLine> {
	const settings = validateLoanBudgetLine(fields);
	if (typeof settings === 'string') throw new BooksRefusal(settings);
	const budget = await findLoanBudget(supabase, organisationId, fields.loanBudgetId);
	refuseWhen(overBudgetRefusal(budget, settings.amount, null));
	const row = { organisation_id: organisationId, budget_id: budget.id, ...toLineColumns(settings) };
	const { data, error } = await supabase.from(LoanBudgetTables.lines).insert(row).select('id').single();
	if (error !== null) throw error;
	return { ...settings, id: (data as { id: string }).id, approval: null, spends: [] };
}

/** Changes only what was given of a line; an approved line goes back to awaiting approval, as what was approved has changed. */
export async function changeLoanBudgetLine(
	supabase: SupabaseClient,
	organisationId: string,
	fields: Record<string, unknown>
): Promise<LoanBudgetLineCorrection> {
	const change = validateLoanBudgetLineChange(fields);
	if (typeof change === 'string') throw new BooksRefusal(change);
	const { budget, line } = await findLoanBudgetLine(supabase, organisationId, fields.budgetLineId);
	const isAmountChanged = change.amount !== undefined;
	if (isAmountChanged) {
		refuseWhen(overBudgetRefusal(budget, change.amount as number, line.id));
		refuseWhen(belowSpentRefusal(line, change.amount as number));
	}
	const columns = { ...toLineColumns(change), ...noApproval, updated_at: new Date().toISOString() };
	const { error } = await supabase.from(LoanBudgetTables.lines).update(columns).eq('organisation_id', organisationId).eq('id', line.id);
	if (error !== null) throw error;
	return { before: line, after: { ...line, ...change, approval: null } };
}

function toLineColumns(settings: Partial<LoanBudgetLineSettings>): Record<string, unknown> {
	const columns = { purpose: settings.purpose, amount: settings.amount, expected_return: settings.expectedReturn };
	return Object.fromEntries(Object.entries(columns).filter(([, value]) => value !== undefined));
}
