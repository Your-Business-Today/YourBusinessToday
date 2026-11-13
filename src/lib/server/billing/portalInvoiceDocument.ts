import { error } from '@sveltejs/kit';
import type { InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { validateRecordId } from '$lib/data/isUuid';
import type { PortalVisitor } from '$lib/portal/portalVisitor';
import { findInvoiceDocument } from '$lib/server/books/invoiceDocument';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { findBilledInvoice } from './billedInvoices';
import { notYourInvoice } from './payingAnInvoice';

const notFound = 404;

/**
 * An invoice Your Business Today raised to the client the portal works in, as a document. Billing's own check lets
 * the visitor in: only an issued, paid or void invoice to their client is found, and anything else is not found.
 */
export async function requirePortalInvoiceDocument(visitor: PortalVisitor, invoiceId: string): Promise<InvoiceDocument> {
	if (validateRecordId('invoice', invoiceId) !== null) error(notFound, notYourInvoice);
	const service = supabaseServiceClient();
	const billed = await findBilledInvoice(service, visitor.clientId, invoiceId);
	if (billed === null) error(notFound, notYourInvoice);
	const document = await findInvoiceDocument(service, billed.organisationId, invoiceId);
	if (document === null) error(notFound, notYourInvoice);
	return document;
}
