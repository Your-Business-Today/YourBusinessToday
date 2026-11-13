import { requirePortalInvoiceDocument } from '$lib/server/billing/portalInvoiceDocument';
import { invoicePdfDownloadOf } from '$lib/server/books/invoicePdf/invoicePdfDownload';
import { requireLinkedPortalVisitor } from '$lib/server/portal/requireLinkedPortalVisitor';
import type { RequestHandler } from './$types';

/** The invoice's PDF, behind the same check as its page: only an invoice raised to the visitor's client is found. */
export const GET: RequestHandler = async (request) => {
	const visitor = await requireLinkedPortalVisitor(request);
	const { invoiceId } = request.params;
	const document = await requirePortalInvoiceDocument(visitor, invoiceId);
	return invoicePdfDownloadOf(document);
};
