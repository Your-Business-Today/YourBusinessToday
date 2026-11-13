import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import type { ExpenseCost } from '$lib/data/books/expensePostings';
import { BooksRefusal, refuseWhen } from './booksRefusal';

/** A cost from a supplier as the books keep it: when, from whom, for what, where it is coded, and when it was paid. */
export type Expense = ExpenseCost & {
	id: string;
	expenseDate: string;
	supplier: string;
	description: string;
	paidOn: string | null;
	recordedJournalId: string | null;
	paymentJournalId: string | null;
};

type ExpenseRow = {
	id: string;
	expense_date: string;
	supplier: string;
	description: string;
	amount: number | string;
	expense_account_id: string;
	cost_centre_id: string | null;
	paid_on: string | null;
	recorded_journal_id: string | null;
	payment_journal_id: string | null;
};

export const expensesTable = 'books_expenses';

export const expenseColumns =
	'id, expense_date, supplier, description, amount, expense_account_id, cost_centre_id, paid_on, recorded_journal_id, payment_journal_id';

/** The organisation's costs, the newest first; only those still owed when asked. */
export async function findExpenses(supabase: SupabaseClient, organisationId: string, isUnpaidOnly: boolean): Promise<Expense[]> {
	const every = supabase.from(expensesTable).select(expenseColumns).eq('organisation_id', organisationId);
	const shown = isUnpaidOnly ? every.is('paid_on', null) : every;
	const { data, error } = await shown.order('expense_date', { ascending: false }).order('created_at', { ascending: false });
	if (error !== null) throw error;
	return (data as unknown as ExpenseRow[]).map(fromExpenseRow);
}

/** The organisation's cost with that id, or a refusal when the id is not one or its books hold no such cost. */
export async function findExpense(supabase: SupabaseClient, organisationId: string, expenseId: unknown): Promise<Expense> {
	refuseWhen(validateRecordId('expense', String(expenseId ?? '')));
	const expense = await findExpenseIfHeld(supabase, organisationId, expenseId as string);
	if (expense === null) throw new BooksRefusal(`No cost ${expenseId} is in this organisation's books; list_expenses lists them.`);
	return expense;
}

/** The organisation's cost with that id as the books hold it now, or null when they no longer hold it. */
export async function findExpenseIfHeld(supabase: SupabaseClient, organisationId: string, expenseId: string): Promise<Expense | null> {
	const { data, error } = await supabase
		.from(expensesTable)
		.select(expenseColumns)
		.eq('organisation_id', organisationId)
		.eq('id', expenseId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return fromExpenseRow(data as unknown as ExpenseRow);
}

export function fromExpenseRow(row: ExpenseRow): Expense {
	return {
		id: row.id,
		expenseDate: row.expense_date,
		supplier: row.supplier,
		description: row.description,
		amount: Number(row.amount),
		expenseAccountId: row.expense_account_id,
		costCentreId: row.cost_centre_id,
		paidOn: row.paid_on,
		recordedJournalId: row.recorded_journal_id,
		paymentJournalId: row.payment_journal_id
	};
}

/** The organisation's cost whose recording is that journal, or null when no cost holds it. */
export async function findExpenseRecordedBy(supabase: SupabaseClient, organisationId: string, journalId: string): Promise<Expense | null> {
	const query = supabase.from(expensesTable).select(expenseColumns).eq('organisation_id', organisationId).eq('recorded_journal_id', journalId);
	const { data, error } = await query;
	if (error !== null) throw error;
	const [row] = (data ?? []) as unknown as ExpenseRow[];
	if (row === undefined) return null;
	return fromExpenseRow(row);
}
