import type { SupabaseClient } from '@supabase/supabase-js';
import { expensePaymentRefusal } from '$lib/data/books/expenseRules';
import { costJournalDescription, costPaymentLines } from '$lib/data/books/expensePostings';
import { validateIsoDate } from '$lib/data/books/isoDate';
import { ExpenseJournalKinds } from '$lib/data/books/journalKinds';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { runBooksStep } from './booksStep';
import { costMoveWords } from './costSteps';
import { findExpense, type Expense } from './expenses';
import { isJournalPosted, journalArgument, prepareStepJournal, type StepJournal } from './journalStep';
import { findOrOpenSystemAccount } from './systemAccounts';

/** A cost marked paid, with the day it was paid and the journal that posted the payment. */
export type PaidExpense = Expense & { paidOn: string; paymentJournalId: string };

const paymentStep = 'pay_books_expense';

/**
 * Marks one of the organisation's unpaid costs paid from the bank on the day given: trade creditors fall by its amount
 * and it leaves the bank. The step locks the cost and goes ahead only while it is still unpaid, posting the payment's
 * journal and marking the cost paid together, so two payments at once pay it once. A cost paid already, or paid or
 * deleted meanwhile, is refused and nothing is posted.
 */
export async function payExpense(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<PaidExpense> {
	refuseWhen(validateIsoDate('paidOn', fields.paidOn));
	const paidOn = fields.paidOn as string;
	const expense = await findExpense(supabase, organisationId, fields.expenseId);
	refuseWhen(expensePaymentRefusal(expense));
	const journal = await preparePaymentJournal(supabase, organisationId, expense, paidOn);
	const isPaid = await runBooksStep(supabase, {
		name: paymentStep,
		inputs: { target_organisation_id: organisationId, target_expense_id: expense.id, payment_paid_on: paidOn, payment_journal: journalArgument(journal) },
		hasHappened: () => isJournalPosted(supabase, organisationId, journal.id),
		...costMoveWords(expense.supplier, `paid on ${paidOn}`)
	});
	if (isPaid) return { ...expense, paidOn, paymentJournalId: journal.id };
	const meanwhile = `The cost from ${expense.supplier} was marked paid, or deleted, while this payment was being recorded`;
	throw new BooksRefusal(`${meanwhile}; list_expenses says where it stands.`);
}

async function preparePaymentJournal(supabase: SupabaseClient, organisationId: string, expense: Expense, paidOn: string): Promise<StepJournal> {
	const [creditorsAccountId, bankAccountId] = await Promise.all([
		findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.tradeCreditors),
		findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.bank)
	]);
	return prepareStepJournal(supabase, organisationId, {
		journalDate: paidOn,
		description: `Paid ${costJournalDescription(expense)}`,
		kind: ExpenseJournalKinds.payment,
		lines: costPaymentLines(creditorsAccountId, bankAccountId, expense.amount)
	});
}
