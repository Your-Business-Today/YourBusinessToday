import type { SupabaseClient } from '@supabase/supabase-js';
import { validateExpense, type ExpenseInput } from '$lib/data/books/expenseRules';
import { costJournalDescription, recordedCostLines } from '$lib/data/books/expensePostings';
import { ExpenseJournalKinds } from '$lib/data/books/journalKinds';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { expenseColumns, expensesTable, fromExpenseRow, type Expense } from './expenses';
import { expenseTargetRefusal } from './expenseTargets';
import { withdrawJournal } from './invoiceStatusMoves';
import { postJournal } from './postJournal';
import { findOrOpenSystemAccount } from './systemAccounts';

/**
 * Records a cost from a supplier in the organisation's books and posts it on the day it is dated: debited to the
 * account it is coded to, within its cost centre, and credited to the bank when it was paid already or to trade
 * creditors until it is. The cost is kept with the journal that posted it; when it cannot be kept, the journal is
 * taken back out, so no posting is left without its cost.
 */
export async function recordExpense(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<Expense> {
	const expense = validateExpense(fields);
	if (typeof expense === 'string') throw new BooksRefusal(expense);
	refuseWhen(await expenseTargetRefusal(supabase, organisationId, expense));
	const settledFrom = expense.isPaid ? SystemAccounts.bank : SystemAccounts.tradeCreditors;
	const settledFromAccountId = await findOrOpenSystemAccount(supabase, organisationId, settledFrom);
	const journalId = await postJournal(supabase, organisationId, {
		journalDate: expense.expenseDate,
		description: costJournalDescription(expense),
		kind: ExpenseJournalKinds.record,
		lines: recordedCostLines(expense, settledFromAccountId)
	});
	return keepExpenseOrWithdraw(supabase, organisationId, expense, journalId);
}

async function keepExpenseOrWithdraw(supabase: SupabaseClient, organisationId: string, expense: ExpenseInput, journalId: string): Promise<Expense> {
	const row = {
		organisation_id: organisationId,
		expense_date: expense.expenseDate,
		supplier: expense.supplier,
		description: expense.description,
		amount: expense.amount,
		expense_account_id: expense.expenseAccountId,
		cost_centre_id: expense.costCentreId,
		paid_on: expense.isPaid ? expense.expenseDate : null,
		recorded_journal_id: journalId
	};
	const { data, error } = await supabase.from(expensesTable).insert(row).select(expenseColumns).single();
	if (error === null) return fromExpenseRow(data);
	await withdrawJournal(supabase, organisationId, journalId);
	throw error;
}
