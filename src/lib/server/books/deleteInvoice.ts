import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteRefusal } from '$lib/data/books/invoiceMoveRules';
import { BooksDeletionKinds } from '$lib/data/books/deletionRecordRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { invoicesTable } from './invoiceRecord';
import { copyInvoiceWithLines } from './deletionCopies';
import { recordBooksDeletion, withdrawBooksDeletion } from './booksDeletions';

/**
 * Deletes one of the organisation's draft or void invoices, with its lines, keeping a record of it first under the person
 * deleting it. An issued or paid invoice is posted to the ledger and is voided instead; one with payments recorded against
 * it is never deleted. A void invoice's journals stay in the ledger, the sale and its reversal, so deleting it takes
 * nothing out of the books' figures.
 */
export async function deleteInvoice(
	supabase: SupabaseClient,
	organisationId: string,
	invoiceId: unknown,
	deletedByAccountId: string
): Promise<HeldInvoice> {
	const invoice = await findHeldInvoice(supabase, organisationId, invoiceId);
	refuseWhen(deleteRefusal(invoice));
	const deletionId = await recordInvoiceDeletion(supabase, organisationId, invoice, deletedByAccountId);
	const { data, error } = await supabase
		.from(invoicesTable)
		.delete()
		.eq('organisation_id', organisationId)
		.eq('id', invoice.id)
		.eq('status', invoice.status)
		.select('id');
	const isDeleted = error === null && (data ?? []).length > 0;
	if (isDeleted) return invoice;
	await withdrawBooksDeletion(supabase, deletionId);
	if (error !== null) throw error;
	throw new BooksRefusal(`Invoice ${invoice.printedNumber} stopped being ${invoice.status} while it was being deleted; read_invoice says where it stands.`);
}

async function recordInvoiceDeletion(supabase: SupabaseClient, organisationId: string, invoice: HeldInvoice, deletedByAccountId: string): Promise<string> {
	const record = await copyInvoiceWithLines(supabase, organisationId, invoice.id);
	return recordBooksDeletion(supabase, {
		organisationId,
		kind: BooksDeletionKinds.invoice,
		recordId: invoice.id,
		knownAs: invoice.printedNumber,
		record: { ...record, customer_name: invoice.customerName },
		journals: [],
		deletedByAccountId
	});
}
