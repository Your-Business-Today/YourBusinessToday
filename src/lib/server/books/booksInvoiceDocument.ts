import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { validateRecordId } from '$lib/data/isUuid';
import { findInvoiceDocument } from './invoiceDocument';

const notFound = 404;
const noSuchInvoice = 'These books hold no such invoice';

/** Any of the organisation's invoices, a draft included, read as the person the Books page let in; not found otherwise. */
export async function requireBooksInvoiceDocument(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<InvoiceDocument> {
	if (validateRecordId('invoice', invoiceId) !== null) error(notFound, noSuchInvoice);
	const document = await findInvoiceDocument(supabase, organisationId, invoiceId);
	if (document === null) error(notFound, noSuchInvoice);
	return document;
}
