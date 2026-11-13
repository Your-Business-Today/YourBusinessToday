import type { SupabaseClient } from '@supabase/supabase-js';
import { paymentRefusal, validatePayment, type InvoicePaymentInput } from '$lib/data/books/invoiceMoveRules';
import { paymentLines } from '$lib/data/books/invoicePostings';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { InvoiceJournalKinds } from '$lib/data/books/journalKinds';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { runBooksStep } from './booksStep';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { invoiceMoveWords, invoiceTarget } from './invoiceSteps';
import { isJournalPosted, journalArgument, prepareStepJournal, type StepJournal } from './journalStep';
import { findOrOpenSystemAccount } from './systemAccounts';

/** Money received against an invoice, with the journal that posted it. */
export type RecordedInvoicePayment = InvoicePaymentInput & { journalId: string };

const paymentStep = 'record_books_invoice_payment';

/**
 * Records money received against one of the organisation's issued invoices, in one step of the database: it posts to
 * the ledger on the day it arrived, into the bank and off trade debtors, is kept against the invoice with that journal,
 * and marks the invoice paid when it settles what is owed. What is owed is worked out again under the invoice's lock,
 * so two payments at once never take more than it owes. More than it owes, or a value its columns cannot hold, is refused.
 */
export async function recordInvoicePayment(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<RecordedInvoicePayment> {
	const payment = validatePayment(fields);
	if (typeof payment === 'string') throw new BooksRefusal(payment);
	const invoice = await findHeldInvoice(supabase, organisationId, fields.invoiceId);
	refuseWhen(paymentRefusal(invoice, payment.amount));
	const bankAccountId = await findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.bank);
	const journal = await preparePaymentJournal(supabase, organisationId, { invoice, payment, bankAccountId });
	const received = formatPoundsAndPence(payment.amount);
	const isRecorded = await runBooksStep(supabase, {
		name: paymentStep,
		inputs: paymentStepInputs(organisationId, invoice, payment, journal),
		hasHappened: () => isJournalPosted(supabase, organisationId, journal.id),
		...invoiceMoveWords(invoice.printedNumber, `paid ${received}`)
	});
	if (isRecorded) return { ...payment, journalId: journal.id };
	const stopped = `Invoice ${invoice.printedNumber} stopped being issued, or came to owe less than ${received}, while the payment was being recorded`;
	throw new BooksRefusal(`${stopped}; read_invoice says where it stands.`);
}

/** A payment on an invoice, and the account the money arrived in. */
export type InvoicePaymentPosting = { invoice: HeldInvoice; payment: InvoicePaymentInput; bankAccountId: string };

/** The journal of money received against the invoice: into the account it arrived in, and off trade debtors. */
export async function preparePaymentJournal(supabase: SupabaseClient, organisationId: string, posting: InvoicePaymentPosting): Promise<StepJournal> {
	const { invoice, payment, bankAccountId } = posting;
	const debtorsAccountId = await findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.tradeDebtors);
	return prepareStepJournal(supabase, organisationId, {
		journalDate: payment.paidOn,
		description: `Payment for invoice ${invoice.printedNumber} from ${invoice.customerName}`,
		kind: InvoiceJournalKinds.payment,
		lines: paymentLines(bankAccountId, debtorsAccountId, payment.amount)
	});
}

/** What 0219's payment step is given: the invoice, the payment and its journal. */
export function paymentStepInputs(organisationId: string, invoice: HeldInvoice, payment: InvoicePaymentInput, journal: StepJournal) {
	const columns = { payment_paid_on: payment.paidOn, payment_amount: payment.amount, invoice_total: invoice.total };
	return { ...invoiceTarget(organisationId, invoice.id), ...columns, payment_journal: journalArgument(journal) };
}
