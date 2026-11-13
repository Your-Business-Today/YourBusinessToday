import type { SupabaseClient } from '@supabase/supabase-js';
import { validateExpense, type ExpenseInput } from '$lib/data/books/expenseRules';
import { costJournalDescription, recordedCostLines } from '$lib/data/books/expensePostings';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { ExpenseJournalKinds } from '$lib/data/books/journalKinds';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { runBooksStep } from './booksStep';
import { costMoveWords } from './costSteps';
import type { Expense } from './expenses';
import { expenseTargetRefusal, withCostAccount } from './expenseTargets';
import { isJournalPosted, journalArgument, prepareStepJournal, type StepJournal } from './journalStep';
import { findOrOpenSystemAccount } from './systemAccounts';

const recordStep = 'record_books_expense';

/**
 * Records a cost from a supplier in the organisation's books and posts it on the day it is dated: debited to the
 * account it is coded to, or to Prepayments when it is paid up front, within its cost centre, and credited to the bank when it was paid already or to trade
 * creditors until it is. The journal, its lines and the cost are written in one step of the database, together or not
 * at all, so no posting is ever left without its cost, nor a cost without its posting.
 */
export async function recordExpense(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<Expense> {
	const prepared = await prepareExpense(supabase, organisationId, fields, null);
	const { recorded, journal } = prepared;
	await runBooksStep(supabase, {
		name: recordStep,
		inputs: expenseStepInputs(organisationId, prepared),
		hasHappened: () => isJournalPosted(supabase, organisationId, journal.id),
		...costMoveWords(recorded.supplier, `recorded for ${formatPoundsAndPence(recorded.amount)}`)
	});
	return recorded;
}

/** A cost ready to be kept, with the journal that posts it, each given its id. */
export type PreparedExpense = { recorded: Expense; journal: StepJournal };

/**
 * The cost checked and its journal made, crediting the account it was paid from when one is given; otherwise the bank
 * when it was paid already, or trade creditors until it is.
 */
export async function prepareExpense(
	supabase: SupabaseClient,
	organisationId: string,
	fields: Record<string, unknown>,
	paidFromAccountId: string | null
): Promise<PreparedExpense> {
	const request = validateExpense(fields);
	if (typeof request === 'string') throw new BooksRefusal(request);
	const expense = await withCostAccount(supabase, organisationId, request);
	refuseWhen(await expenseTargetRefusal(supabase, organisationId, expense));
	const settledFrom = expense.isPaid ? SystemAccounts.bank : SystemAccounts.tradeCreditors;
	const settledFromAccountId = paidFromAccountId ?? (await findOrOpenSystemAccount(supabase, organisationId, settledFrom));
	const journal = await prepareStepJournal(supabase, organisationId, {
		journalDate: expense.expenseDate,
		description: costJournalDescription(expense),
		kind: ExpenseJournalKinds.record,
		lines: recordedCostLines(expense, settledFromAccountId)
	});
	return { recorded: recordedExpense(expense, journal.id), journal };
}

/** What 0198's recording step is given: the cost's columns and its journal. */
export function expenseStepInputs(organisationId: string, prepared: PreparedExpense) {
	return { target_organisation_id: organisationId, ...stepColumns(prepared.recorded), recorded_journal: journalArgument(prepared.journal) };
}

function recordedExpense(expense: ExpenseInput, journalId: string): Expense {
	const { isPaid, ...cost } = expense;
	const paidOn = isPaid ? expense.expenseDate : null;
	return { ...cost, id: crypto.randomUUID(), paidOn, recordedJournalId: journalId, paymentJournalId: null };
}

function stepColumns(expense: Expense) {
	return {
		new_expense_id: expense.id,
		expense_date: expense.expenseDate,
		supplier: expense.supplier,
		description: expense.description,
		amount: expense.amount,
		expense_account_id: expense.expenseAccountId,
		cost_centre_id: expense.costCentreId,
		paid_on: expense.paidOn
	};
}
