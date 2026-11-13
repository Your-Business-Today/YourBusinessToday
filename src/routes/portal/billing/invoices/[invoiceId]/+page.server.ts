import { error } from '@sveltejs/kit';
import { validateRecordId } from '$lib/data/isUuid';
import { findBilledInvoice } from '$lib/server/billing/billedInvoices';
import { notYourInvoice } from '$lib/server/billing/payingAnInvoice';
import { findInvoiceDocument } from '$lib/server/books/invoiceDocument';
import { requireLinkedPortalVisitor } from '$lib/server/portal/requireLinkedPortalVisitor';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { PageServerLoad } from './$types';

const notFound = 404;

/**
 * An invoice Your Business Today raised to the client the portal works in, as a document. Billing's own check lets
 * the visitor in: only an issued, paid or void invoice to their client is found, and anything else is not found.
 */
export const load: PageServerLoad = async (page) => {
	const visitor = await requireLinkedPortalVisitor(page);
	const { invoiceId } = page.params;
	if (validateRecordId('invoice', invoiceId) !== null) error(notFound, notYourInvoice);
	const service = supabaseServiceClient();
	const billed = await findBilledInvoice(service, visitor.clientId, invoiceId);
	if (billed === null) error(notFound, notYourInvoice);
	const document = await findInvoiceDocument(service, billed.organisationId, invoiceId);
	if (document === null) error(notFound, notYourInvoice);
	return { visitor, document };
};
