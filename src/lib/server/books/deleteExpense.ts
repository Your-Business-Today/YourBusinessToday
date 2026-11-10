import type { SupabaseClient } from '@supabase/supabase-js';
import { BooksDeletionKinds } from '$lib/data/books/deletionRecordRules';
import { BooksRefusal } from './booksRefusal';
import { findExpense, type Expense } from './expenses';
import { copyCostWithJournals } from './deletionCopies';
import { recordBooksDeletion, withdrawBooksDeletion } from './booksDeletions';

const deleteCostWithItsJournals = 'delete_books_expense';

/**
 * Deletes a cost recorded by mistake from the organisation's books, keeping a record of it first under the person deleting
 * it, and takes out of the ledger the journals it posted, its recording and its payment, with their lines. The cost and
 * its journals go together in one step of the database, or not at all. A cost that was real is never deleted this way.
 */
export async function deleteExpense(
	supabase: SupabaseClient,
	organisationId: string,
	expenseId: unknown,
	deletedByAccountId: string
): Promise<Expense> {
	const expense = await findExpense(supabase, organisationId, expenseId);
	const deletionId = await recordCostDeletion(supabase, organisationId, expense, deletedByAccountId);
	const { data, error } = await supabase.rpc(deleteCostWithItsJournals, { target_organisation_id: organisationId, target_expense_id: expense.id });
	const isDeleted = error === null && data === true;
	if (isDeleted) return expense;
	await withdrawBooksDeletion(supabase, deletionId);
	if (error !== null) throw error;
	throw new BooksRefusal(`The cost from ${expense.supplier} was deleted meanwhile; list_expenses lists what is left.`);
}

async function recordCostDeletion(supabase: SupabaseClient, organisationId: string, expense: Expense, deletedByAccountId: string): Promise<string> {
	const copy = await copyCostWithJournals(supabase, organisationId, expense.id);
	return recordBooksDeletion(supabase, {
		organisationId,
		kind: BooksDeletionKinds.cost,
		recordId: expense.id,
		knownAs: expense.supplier,
		record: copy.record,
		journals: copy.journals,
		deletedByAccountId
	});
}
