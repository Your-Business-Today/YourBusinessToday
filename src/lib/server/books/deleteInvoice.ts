import type { SupabaseClient } from '@supabase/supabase-js';
import { deleteRefusal } from '$lib/data/books/invoiceMoveRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findHeldInvoice, type HeldInvoice } from './heldInvoice';
import { invoicesTable } from './invoiceRecord';

/**
 * Deletes one of the organisation's draft or void invoices, with its lines. An issued or paid invoice is posted to the
 * ledger and is voided instead; one with payments recorded against it is never deleted. A void invoice's journals stay
 * in the ledger, the sale and its reversal, so deleting it takes nothing out of the books' figures.
 */
export async function deleteInvoice(supabase: SupabaseClient, organisationId: string, invoiceId: unknown): Promise<HeldInvoice> {
	const invoice = await findHeldInvoice(supabase, organisationId, invoiceId);
	refuseWhen(deleteRefusal(invoice));
	const { data, error } = await supabase
		.from(invoicesTable)
		.delete()
		.eq('organisation_id', organisationId)
		.eq('id', invoice.id)
		.eq('status', invoice.status)
		.select('id');
	if (error !== null) throw error;
	const isDeleted = (data ?? []).length > 0;
	if (isDeleted) return invoice;
	throw new BooksRefusal(`Invoice ${invoice.printedNumber} stopped being ${invoice.status} while it was being deleted; read_invoice says where it stands.`);
}
