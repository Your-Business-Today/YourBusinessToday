import type { SupabaseClient } from '@supabase/supabase-js';
import { voidRefusal } from '$lib/data/books/invoiceMoveRules';
import { reversedLines } from '$lib/data/books/invoicePostings';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { InvoiceJournalKinds } from '$lib/data/books/journalKinds';
import { ukClockAt } from '$lib/data/ukClock';
import { refuseWhen } from './booksRefusal';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { findIssuedJournalId } from './issuedJournal';
import { moveInvoiceOrWithdraw } from './invoiceStatusMoves';
import { findJournalLines } from './journalLines';
import { postJournal } from './postJournal';

/** The invoice voided, with the reversal it posted, or null when the invoice had posted nothing to reverse. */
export type VoidedInvoice = HeldInvoice & { reversalJournalId: string | null };

/**
 * Voids one of the organisation's invoices. An issued one has its sale reversed rather than removed: a journal dated
 * today puts the lines it posted on the other sides, naming the journal it reverses. A draft posted nothing, so it is
 * marked void and nothing more. One with payments recorded against it is refused.
 */
export async function voidInvoice(supabase: SupabaseClient, organisationId: string, invoiceId: unknown): Promise<VoidedInvoice> {
	const invoice = await findHeldInvoice(supabase, organisationId, invoiceId);
	refuseWhen(voidRefusal(invoice));
	const reversalJournalId = await postReversal(supabase, organisationId, invoice);
	const columns = { status: InvoiceStatuses.void };
	await moveInvoiceOrWithdraw(supabase, organisationId, invoice, { from: invoice.status, columns, journalId: reversalJournalId });
	return { ...invoice, reversalJournalId };
}

async function postReversal(supabase: SupabaseClient, organisationId: string, invoice: HeldInvoice): Promise<string | null> {
	const issuedJournalId = await findIssuedJournalId(supabase, organisationId, invoice.id);
	if (issuedJournalId === null) return null;
	const issuedLines = await findJournalLines(supabase, organisationId, issuedJournalId);
	return postJournal(supabase, organisationId, {
		journalDate: ukClockAt(new Date()).date,
		description: `Void of invoice ${invoice.printedNumber} to ${invoice.customerName}`,
		kind: InvoiceJournalKinds.void,
		reversesJournalId: issuedJournalId,
		lines: reversedLines(issuedLines)
	});
}
