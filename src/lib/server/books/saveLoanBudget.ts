import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoanBudget } from '$lib/data/books/loanBudget/loanBudget';
import { validateLoanBudget, validateLoanBudgetChange } from '$lib/data/books/loanBudget/loanBudgetRules';
import { totalsOf } from '$lib/data/books/loanBudget/loanBudgetTotals';
import { formatPoundsAndPence, toPence } from '$lib/data/books/money';
import { BooksRefusal } from './booksRefusal';
import { LoanBudgetTables, toLoanBudgetColumns } from './loanBudgetRecord';
import { findLoanBudget } from './loanBudgets';

/** A loan budget as it stood before a change and as it reads after it. */
export type LoanBudgetCorrection = { before: LoanBudget; after: LoanBudget };

/** Keeps a new loan budget in the books, checked against its columns first; nothing is posted and nothing drawn. */
export async function openLoanBudget(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<LoanBudget> {
	const settings = validateLoanBudget(fields);
	if (typeof settings === 'string') throw new BooksRefusal(settings);
	const { data, error } = await supabase
		.from(LoanBudgetTables.budgets)
		.insert({ organisation_id: organisationId, ...toLoanBudgetColumns(settings) })
		.select('id')
		.single();
	if (error !== null) throw error;
	return { ...settings, id: (data as { id: string }).id, draws: [], lines: [] };
}

/** Changes only what was given of a loan budget; the loan never falls below what its lines or its draws already come to. */
export async function changeLoanBudget(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<LoanBudgetCorrection> {
	const change = validateLoanBudgetChange(fields);
	if (typeof change === 'string') throw new BooksRefusal(change);
	const before = await findLoanBudget(supabase, organisationId, fields.loanBudgetId);
	const isLoanAmountChanged = change.loanAmount !== undefined;
	if (isLoanAmountChanged) refuseLoanBelowUse(before, change.loanAmount as number);
	const columns = { ...toLoanBudgetColumns(change), updated_at: new Date().toISOString() };
	const { error } = await supabase.from(LoanBudgetTables.budgets).update(columns).eq('organisation_id', organisationId).eq('id', before.id);
	if (error !== null) throw error;
	return { before, after: await findLoanBudget(supabase, organisationId, before.id) };
}

function refuseLoanBelowUse(budget: LoanBudget, loanAmount: number): void {
	const { budgeted, drawn } = totalsOf(budget);
	const used = Math.max(toPence(budgeted), toPence(drawn));
	if (toPence(loanAmount) >= used) return;
	const uses = `its lines come to ${formatPoundsAndPence(budgeted)} and its draws to ${formatPoundsAndPence(drawn)}`;
	throw new BooksRefusal(`loanAmount cannot fall below what ${budget.title} already holds: ${uses}.`);
}
