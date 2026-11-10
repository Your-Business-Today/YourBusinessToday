import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteRefusal } from '$lib/data/books/invoiceMoveRules';
import { BooksDeletionKinds, type BooksDeletionEntry } from '$lib/data/books/deletionRecordRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { deleteKeepingRecord, type DeletionStep } from './booksDeletions';

/** An invoice as it was deleted, with the id of the record kept of it. */
export type DeletedInvoice = HeldInvoice & { deletionId: string };

const deleteInvoiceKeepingRecord = 'delete_books_invoice_keeping_record';

/**
 * Deletes one of the organisation's draft or void invoices, with its lines, and keeps a record of it under the person
 * deleting it, in one step of the database. An issued or paid invoice is posted to the ledger and is voided instead; one
 * with payments recorded against it is never deleted. A void invoice's journals stay in the ledger, the sale and its
 * reversal, so deleting it takes nothing out of the books' figures.
 */
export async function deleteInvoice(
	supabase: SupabaseClient,
	organisationId: string,
	invoiceId: unknown,
	deletedByAccountId: string
): Promise<DeletedInvoice> {
	const invoice = await findHeldInvoice(supabase, organisationId, invoiceId);
	refuseWhen(deleteRefusal(invoice));
	const entry = { organisationId, kind: BooksDeletionKinds.invoice, recordId: invoice.id, knownAs: invoice.printedNumber, deletedByAccountId };
	const deletionId = await deleteKeepingRecord(supabase, entry, invoiceDeletionStep(entry, invoice));
	if (deletionId !== null) return { ...invoice, deletionId };
	const stopped = `Invoice ${invoice.printedNumber} stopped being ${invoice.status}, or had a payment recorded, while it was being deleted`;
	throw new BooksRefusal(`${stopped}; read_invoice says where it stands.`);
}

function invoiceDeletionStep(entry: BooksDeletionEntry, invoice: HeldInvoice): DeletionStep {
	const inputs = {
		target_organisation_id: entry.organisationId,
		target_invoice_id: entry.recordId,
		expected_status: invoice.status,
		invoice_known_as: entry.knownAs,
		customer_label: invoice.customerName,
		deleting_account_id: entry.deletedByAccountId
	};
	return { name: deleteInvoiceKeepingRecord, inputs };
}
