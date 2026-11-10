import type { SupabaseClient } from '@supabase/supabase-js';
import { BooksDeletionKinds, type BooksDeletionEntry } from '$lib/data/books/deletionRecordRules';
import { BooksRefusal } from './booksRefusal';
import { findExpense, type Expense } from './expenses';
import { deleteKeepingRecord, type DeletionStep } from './booksDeletions';

/** A cost as it was deleted, with the id of the record kept of it. */
export type DeletedExpense = Expense & { deletionId: string };

const deleteCostKeepingRecord = 'delete_books_cost_keeping_record';

/**
 * Deletes a cost recorded by mistake from the organisation's books with the journals it posted, its recording and its
 * payment, and their lines, and keeps a record of all of it under the person deleting it. The cost, its journals and
 * the record go together in one step of the database, or not at all. A cost that was real is never deleted this way.
 */
export async function deleteExpense(
	supabase: SupabaseClient,
	organisationId: string,
	expenseId: unknown,
	deletedByAccountId: string
): Promise<DeletedExpense> {
	const expense = await findExpense(supabase, organisationId, expenseId);
	const entry = { organisationId, kind: BooksDeletionKinds.cost, recordId: expense.id, knownAs: expense.supplier, deletedByAccountId };
	const deletionId = await deleteKeepingRecord(supabase, entry, costDeletionStep(entry));
	if (deletionId !== null) return { ...expense, deletionId };
	throw new BooksRefusal(`The cost from ${expense.supplier} is no longer in the books; list_expenses lists what is left.`);
}

function costDeletionStep(entry: BooksDeletionEntry): DeletionStep {
	const inputs = {
		target_organisation_id: entry.organisationId,
		target_expense_id: entry.recordId,
		cost_known_as: entry.knownAs,
		deleting_account_id: entry.deletedByAccountId
	};
	return { name: deleteCostKeepingRecord, inputs };
}
