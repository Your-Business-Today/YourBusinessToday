import { portalBilledInvoicePdfPath } from '$lib/portal/portalPaths';
import { requirePortalInvoiceDocument } from '$lib/server/billing/portalInvoiceDocument';
import { requireLinkedPortalVisitor } from '$lib/server/portal/requireLinkedPortalVisitor';
import type { PageServerLoad } from './$types';

/** An invoice Your Business Today raised to the client the portal works in, as a document, with its PDF to download. */
export const load: PageServerLoad = async (page) => {
	const visitor = await requireLinkedPortalVisitor(page);
	const { invoiceId } = page.params;
	const document = await requirePortalInvoiceDocument(visitor, invoiceId);
	return { visitor, document, pdfHref: portalBilledInvoicePdfPath(document.invoiceId) };
};
