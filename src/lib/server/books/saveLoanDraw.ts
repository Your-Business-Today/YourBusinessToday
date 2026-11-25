import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoanDraw } from '$lib/data/books/loanBudget/loanBudget';
import { validateLoanDraw } from '$lib/data/books/loanBudget/loanBudgetLineRules';
import { overDrawnRefusal } from '$lib/data/books/loanBudget/loanBudgetTotals';
import { monthStart } from '$lib/data/books/monthKey';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { LoanBudgetTables } from './loanBudgetRecord';
import { findLoanBudget } from './loanBudgets';

/** Keeps a part of the loan drawn, or to be drawn, in a month; the draws never come to more than the loan. */
export async function addLoanDraw(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<LoanDraw> {
	const draw = validateLoanDraw(fields);
	if (typeof draw === 'string') throw new BooksRefusal(draw);
	const budget = await findLoanBudget(supabase, organisationId, fields.loanBudgetId);
	refuseWhen(overDrawnRefusal(budget, draw.amount, null));
	const row = { organisation_id: organisationId, budget_id: budget.id, month: monthStart(draw.month), amount: draw.amount };
	const { data, error } = await supabase.from(LoanBudgetTables.draws).insert(row).select('id').single();
	if (error !== null) throw error;
	return { ...draw, id: (data as { id: string }).id };
}
