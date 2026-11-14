import { booksInvoicePdfPathOf, booksInvoicesPathOf } from '$lib/data/books/page/booksPaths';
import { requireBooksInvoiceDocument } from '$lib/server/books/booksInvoiceDocument';
import type { PageServerLoad } from './$types';

/** Any of the organisation's invoices, a draft included, to the people the Books page lets in, with its PDF to download. */
export const load: PageServerLoad = async ({ locals, parent, params }) => {
	const { booksOrganisation } = await parent();
	const document = await requireBooksInvoiceDocument(locals.supabase, booksOrganisation.id, params.invoiceId);
	const pdfHref = booksInvoicePdfPathOf(booksOrganisation.id, document.invoiceId);
	return { document, invoicesHref: booksInvoicesPathOf(booksOrganisation.id), pdfHref };
};
