import type { SupabaseClient } from '@supabase/supabase-js';
import { BooksRefusal } from '$lib/server/books/booksRefusal';
import { findInvoiceInFull } from '$lib/server/books/invoices';
import { findInvoiceNamings } from '$lib/server/books/invoiceNamings';
import { describeInvoiceInFull } from './describeInvoices';

/** The invoice in full as the person knows it, or a refusal when the organisation's books hold none with that id. */
export async function readInvoiceInFull(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<string> {
	const [invoice, namings] = await Promise.all([
		findInvoiceInFull(supabase, organisationId, invoiceId),
		findInvoiceNamings(supabase, organisationId)
	]);
	if (invoice === null) throw new BooksRefusal(`No invoice ${invoiceId} is in this organisation's books; list_invoices lists them.`);
	return describeInvoiceInFull(invoice, namings);
}
