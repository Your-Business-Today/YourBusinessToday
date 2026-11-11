import type { SupabaseClient } from '@supabase/supabase-js';
import { refundLines } from '$lib/data/books/invoicePostings';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { InvoiceJournalKinds } from '$lib/data/books/journalKinds';
import type { JournalLineInput } from '$lib/data/books/journalLine';
import { SystemAccounts } from '$lib/data/books/systemAccounts';
import { BooksRefusal } from './booksRefusal';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { findIssuedJournalId } from './issuedJournal';
import { findJournalLines } from './journalLines';
import { findOrOpenSystemAccount } from './systemAccounts';
import { invoiceMoveWords } from './invoiceSteps';
import { postJournalSet } from './journalSet';
import { prepareStepJournal } from './journalStep';

/** Money handed back on an invoice that was paid: how much, and the UK day it left. */
export type InvoiceRefund = { invoiceId: string; amount: number; refundedOn: string };

const nothing = 0;

/**
 * Posts money refunded on a paid invoice as a journal of its own: it leaves the bank, and the sale the invoice made
 * is taken back off its income accounts in proportion. There are no credit notes, so the invoice itself is not changed.
 * The journal and its lines are written in one step of the database, and its id answered. An invoice that was never
 * issued, or posted no sale, is refused.
 */
export async function postInvoiceRefund(supabase: SupabaseClient, organisationId: string, refund: InvoiceRefund): Promise<string> {
	const invoice = await findHeldInvoice(supabase, organisationId, refund.invoiceId);
	const saleLines = await findSaleLines(supabase, organisationId, invoice);
	const bankAccountId = await findOrOpenSystemAccount(supabase, organisationId, SystemAccounts.bank);
	const journal = await prepareStepJournal(supabase, organisationId, {
		journalDate: refund.refundedOn,
		description: `Refund on invoice ${invoice.printedNumber} to ${invoice.customerName}`,
		kind: InvoiceJournalKinds.refund,
		lines: refundLines(bankAccountId, saleLines, refund.amount)
	});
	const refunded = `refunded ${formatPoundsAndPence(refund.amount)}`;
	await postJournalSet(supabase, organisationId, [journal], invoiceMoveWords(invoice.printedNumber, refunded));
	return journal.id;
}

async function findSaleLines(supabase: SupabaseClient, organisationId: string, invoice: HeldInvoice): Promise<JournalLineInput[]> {
	const wasIssued = invoice.status === InvoiceStatuses.issued || invoice.status === InvoiceStatuses.paid;
	const issuedJournalId = wasIssued ? await findIssuedJournalId(supabase, organisationId, invoice.id) : null;
	const issuedLines = issuedJournalId === null ? [] : await findJournalLines(supabase, organisationId, issuedJournalId);
	const saleLines = issuedLines.filter((line) => line.credit > nothing);
	if (saleLines.length > nothing) return saleLines;
	throw new BooksRefusal(`Invoice ${invoice.printedNumber} is ${invoice.status} and posted no sale, so a refund on it is not posted.`);
}
