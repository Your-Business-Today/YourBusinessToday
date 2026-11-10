import type { SupabaseClient } from '@supabase/supabase-js';
import { BooksRefusal } from './booksRefusal';
import { expensesTable, findExpense, type Expense } from './expenses';

/**
 * Deletes a cost recorded by mistake from the organisation's books, and takes out of the ledger the journals it
 * posted, its recording and its payment, with their lines. A cost that was real is never deleted this way.
 */
export async function deleteExpense(supabase: SupabaseClient, organisationId: string, expenseId: unknown): Promise<Expense> {
	const expense = await findExpense(supabase, organisationId, expenseId);
	const { data, error } = await supabase
		.from(expensesTable)
		.delete()
		.eq('organisation_id', organisationId)
		.eq('id', expense.id)
		.select('id');
	if (error !== null) throw error;
	const isDeleted = (data ?? []).length > 0;
	if (!isDeleted) throw new BooksRefusal(`The cost from ${expense.supplier} was deleted meanwhile; list_expenses lists what is left.`);
	await deleteJournals(supabase, organisationId, [expense.recordedJournalId, expense.paymentJournalId]);
	return expense;
}

async function deleteJournals(supabase: SupabaseClient, organisationId: string, journalIds: (string | null)[]): Promise<void> {
	const postedIds = journalIds.filter((journalId): journalId is string => journalId !== null);
	if (postedIds.length === 0) return;
	const { error } = await supabase.from('books_journals').delete().eq('organisation_id', organisationId).in('id', postedIds);
	if (error !== null) throw error;
}
