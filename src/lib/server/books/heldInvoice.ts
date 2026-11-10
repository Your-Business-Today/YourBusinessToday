import type { SupabaseClient } from '@supabase/supabase-js';
import { validateRecordId } from '$lib/data/isUuid';
import type { InvoiceForMove } from '$lib/data/books/invoiceMoveRules';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { findInvoiceInFull, type InvoiceInFull } from './invoices';
import { customerNameOf, findInvoiceNamings, invoiceNumberAsPrinted } from './invoiceNamings';

/** An invoice in full as the person knows it, by its printed number and its customer's name, ready to be moved on. */
export type HeldInvoice = InvoiceInFull & InvoiceForMove & { customerName: string };

/** The organisation's invoice with that id, or a refusal when the id is not one or its books hold no such invoice. */
export async function findHeldInvoice(supabase: SupabaseClient, organisationId: string, invoiceId: unknown): Promise<HeldInvoice> {
	refuseWhen(validateRecordId('invoice', String(invoiceId ?? '')));
	const [invoice, namings] = await Promise.all([
		findInvoiceInFull(supabase, organisationId, invoiceId as string),
		findInvoiceNamings(supabase, organisationId)
	]);
	if (invoice === null) throw new BooksRefusal(`No invoice ${invoiceId} is in this organisation's books; list_invoices lists them.`);
	return {
		...invoice,
		printedNumber: invoiceNumberAsPrinted(namings, invoice.invoiceNumber),
		customerName: customerNameOf(namings, invoice.customerId)
	};
}
