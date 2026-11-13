import { requireBooksInvoiceDocument } from '$lib/server/books/booksInvoiceDocument';
import { invoicePdfDownloadOf } from '$lib/server/books/invoicePdf/invoicePdfDownload';
import { requireOrganisationModule } from '$lib/server/auth/requireOrganisationModule';
import type { RequestHandler } from './$types';

/** The invoice's PDF, behind the same check as the Books page: the books must be on and the person let in to them. */
export const GET: RequestHandler = async ({ locals, params }) => {
	const { organisation } = await requireOrganisationModule(locals, params.organisationId, 'books');
	const document = await requireBooksInvoiceDocument(locals.supabase, organisation.id, params.invoiceId);
	return invoicePdfDownloadOf(document);
};
