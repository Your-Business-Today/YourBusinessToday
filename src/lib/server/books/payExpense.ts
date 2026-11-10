import type { SupabaseClient } from '@supabase/supabase-js';
import { expensePaymentRefusal } from '$lib/data/books/expenseRules';
import { costJournalDescription, costPaymentLines } from '$lib/data/books/expensePostings';
import { validateIsoDate } from '$lib/data/books/isoDate';
import { ExpenseJournalKinds } from '$lib/data/books/journalKinds';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { expensesTable, findExpense, type Expense } from './expenses';
import { withdrawJournal } from './invoiceStatusMoves';
import { postJournal } from './postJournal';
import { findOrOpenSystemAccount } from './systemAccounts';

/** A cost marked paid, with the day it was paid and the journal that posted the payment. */
export type PaidExpense = Expense & { paidOn: string; paymentJournalId: string };

/**
 * Marks one of the organisation's unpaid costs paid from the bank on the day given: trade creditors fall by its amount
 * and it leaves the bank. A cost paid already, or paid meanwhile, is refused, and the payment's journal taken back out.
 */
export async function payExpense(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<PaidExpense> {
	refuseWhen(validateIsoDate('paidOn', fields.paidOn));
	const paidOn = fields.paidOn as string;
	const expense = await findExpense(supabase, organisationId, fields.expenseId);
	refuseWhen(expensePaymentRefusal(expense));
	const [creditorsAccountId, bankAccountId] = await Promise.all([
		findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.tradeCreditors),
		findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.bank)
	]);
	const paymentJournalId = await postJournal(supabase, organisationId, {
		journalDate: paidOn,
		description: `Paid ${costJournalDescription(expense)}`,
		kind: ExpenseJournalKinds.payment,
		lines: costPaymentLines(creditorsAccountId, bankAccountId, expense.amount)
	});
	const paid = { ...expense, paidOn, paymentJournalId };
	await markPaidOrWithdraw(supabase, organisationId, paid);
	return paid;
}

async function markPaidOrWithdraw(supabase: SupabaseClient, organisationId: string, paid: PaidExpense): Promise<void> {
	const { data, error } = await supabase
		.from(expensesTable)
		.update({ paid_on: paid.paidOn, payment_journal_id: paid.paymentJournalId })
		.eq('organisation_id', organisationId)
		.eq('id', paid.id)
		.is('paid_on', null)
		.select('id');
	const isMarked = error === null && (data ?? []).length > 0;
	if (isMarked) return;
	await withdrawJournal(supabase, organisationId, paid.paymentJournalId);
	if (error !== null) throw error;
	throw new BooksRefusal(`The cost from ${paid.supplier} was marked paid while this payment was being recorded; list_expenses says where it stands.`);
}
