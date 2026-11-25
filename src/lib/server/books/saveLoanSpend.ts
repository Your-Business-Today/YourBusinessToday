import type { SupabaseClient } from '@supabase/supabase-js';
import type { LoanBudgetLine, LoanSpend } from '$lib/data/books/loanBudget/loanBudget';
import { spendRefusal } from '$lib/data/books/loanBudget/loanLineSpending';
import { validateLoanSpend } from '$lib/data/books/loanBudget/loanSpendRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findExpense } from './expenses';
import { findLoanBudgetLine } from './loanBudgets';
import { loanSpendsTable, toLoanSpendColumns } from './loanSpendRecord';

/** A spend as kept, and the line it was spent from as it reads after it. */
export type RecordedLoanSpend = { spend: LoanSpend; line: LoanBudgetLine };

/**
 * Keeps money spent from the loan against one line of its budget. Only a line a director has approved is spent from,
 * and never past its amount; the cost in the books it matches, when given, must be one the books hold.
 */
export async function recordLoanSpend(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<RecordedLoanSpend> {
	const settings = validateLoanSpend(fields);
	if (typeof settings === 'string') throw new BooksRefusal(settings);
	const { line } = await findLoanBudgetLine(supabase, organisationId, fields.budgetLineId);
	refuseWhen(spendRefusal(line, settings.amount));
	if (settings.expenseId !== null) await findExpense(supabase, organisationId, settings.expenseId);
	const row = toLoanSpendColumns(organisationId, line.id, settings);
	const { data, error } = await supabase.from(loanSpendsTable).insert(row).select('id').single();
	if (error !== null) throw error;
	const spend = { ...settings, id: (data as { id: string }).id };
	return { spend, line: { ...line, spends: [...line.spends, spend] } };
}
