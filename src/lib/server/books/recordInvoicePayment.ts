import type { SupabaseClient } from '@supabase/supabase-js';
import { paymentRefusal, validatePayment, type InvoicePaymentInput } from '$lib/data/books/invoiceMoveRules';
import { paymentLines } from '$lib/data/books/invoicePostings';
import { differenceOf } from '$lib/data/books/money';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { InvoiceJournalKinds } from '$lib/data/books/journalKinds';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { insertInvoicePayment } from './invoicePayments';
import { invoicesTable } from './invoiceRecord';
import { withdrawJournal } from './invoiceStatusMoves';
import { postJournal } from './postJournal';
import { findOrOpenSystemAccount } from './systemAccounts';

/**
 * Records money received against one of the organisation's issued invoices: it posts to the ledger on the day it
 * arrived, into the bank and off trade debtors, and is kept against the invoice with that journal. A payment that
 * settles what the invoice owes marks it paid. More than it owes, or a value its columns cannot hold, is refused.
 */
export async function recordInvoicePayment(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<InvoicePaymentInput> {
	const payment = validatePayment(fields);
	if (typeof payment === 'string') throw new BooksRefusal(payment);
	const invoice = await findHeldInvoice(supabase, organisationId, fields.invoiceId);
	refuseWhen(paymentRefusal(invoice, payment.amount));
	const [bankAccountId, debtorsAccountId] = await Promise.all([
		findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.bank),
		findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.tradeDebtors)
	]);
	const journalId = await postJournal(supabase, organisationId, {
		journalDate: payment.paidOn,
		description: `Payment for invoice ${invoice.printedNumber} from ${invoice.customerName}`,
		kind: InvoiceJournalKinds.payment,
		lines: paymentLines(bankAccountId, debtorsAccountId, payment.amount)
	});
	await keepPaymentOrWithdraw(supabase, organisationId, invoice, { ...payment, journalId });
	await markPaidWhenSettled(supabase, organisationId, invoice, payment.amount);
	return payment;
}

async function keepPaymentOrWithdraw(
	supabase: SupabaseClient,
	organisationId: string,
	invoice: HeldInvoice,
	payment: InvoicePaymentInput & { journalId: string }
): Promise<void> {
	try {
		await insertInvoicePayment(supabase, organisationId, invoice.id, payment);
	} catch (failure) {
		await withdrawJournal(supabase, organisationId, payment.journalId);
		throw failure;
	}
}

async function markPaidWhenSettled(supabase: SupabaseClient, organisationId: string, invoice: HeldInvoice, amount: number): Promise<void> {
	const owedBefore = differenceOf(invoice.total, invoice.amountPaid);
	const isSettled = amount === owedBefore;
	if (!isSettled) return;
	const { error } = await supabase
		.from(invoicesTable)
		.update({ status: InvoiceStatuses.paid })
		.eq('organisation_id', organisationId)
		.eq('id', invoice.id)
		.eq('status', InvoiceStatuses.issued);
	if (error !== null) throw error;
}
