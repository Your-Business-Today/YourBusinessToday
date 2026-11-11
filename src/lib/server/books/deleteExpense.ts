import type { SupabaseClient } from '@supabase/supabase-js';
import { BooksDeletionKinds, type BooksDeletionEntry } from '$lib/data/books/deletionRecordRules';
import { reversedCostRefusal } from '$lib/data/books/costReversalRules';
import { BooksRefusal } from './booksRefusal';
import { findExpense, findExpenseIfHeld, type Expense } from './expenses';
import { deleteKeepingRecord, type DeletionStep } from './booksDeletions';
import { findCostReversals, refuseReversedCost } from './costReversals';

/** A cost as it was deleted, with the id of the record kept of it. */
export type DeletedExpense = Expense & { deletionId: string };

const deleteCostKeepingRecord = 'delete_books_cost_keeping_record';

/**
 * Deletes a cost recorded by mistake from the organisation's books with the journals it posted, its recording and its
 * payment, and their lines, and keeps a record of all of it under the person deleting it. The cost, its journals and
 * the record go together in one step of the database, or not at all. A cost that was real is never deleted this way,
 * and nor is one whose recording or payment another journal reverses: it stays in the books as recorded and reversed,
 * checked here and again in the database once the cost and its journals are locked.
 */
export async function deleteExpense(
	supabase: SupabaseClient,
	organisationId: string,
	expenseId: unknown,
	deletedByAccountId: string
): Promise<DeletedExpense> {
	const expense = await findExpense(supabase, organisationId, expenseId);
	await refuseReversedCost(supabase, organisationId, expense);
	const entry = { organisationId, kind: BooksDeletionKinds.cost, recordId: expense.id, knownAs: expense.supplier, deletedByAccountId };
	const deletionId = await deleteKeepingRecord(supabase, entry, costDeletionStep(entry));
	if (deletionId !== null) return { ...expense, deletionId };
	throw await refusalOfAStoppedDelete(supabase, organisationId, expense);
}

/** Why the database deleted nothing: the cost went meanwhile, or a journal now reverses its recording or payment. */
async function refusalOfAStoppedDelete(supabase: SupabaseClient, organisationId: string, expense: Expense): Promise<BooksRefusal> {
	const stillHeld = await findExpenseIfHeld(supabase, organisationId, expense.id);
	if (stillHeld === null) return new BooksRefusal(`The cost from ${expense.supplier} is no longer in the books; list_expenses lists what is left.`);
	const reversals = await findCostReversals(supabase, organisationId, stillHeld);
	const changedMeanwhile = `The cost from ${expense.supplier} changed while it was being deleted; list_expenses says where it stands.`;
	return new BooksRefusal(reversedCostRefusal(stillHeld, reversals) ?? changedMeanwhile);
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
