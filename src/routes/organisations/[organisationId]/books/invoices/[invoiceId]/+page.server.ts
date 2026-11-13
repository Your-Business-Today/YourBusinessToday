import { error } from '@sveltejs/kit';
import { validateRecordId } from '$lib/data/isUuid';
import { booksInvoicesPathOf } from '$lib/data/books/page/booksPaths';
import { findInvoiceDocument } from '$lib/server/books/invoiceDocument';
import type { PageServerLoad } from './$types';

const notFound = 404;
const noSuchInvoice = 'These books hold no such invoice';

/** Any of the organisation's invoices, a draft included, to the people the Books page lets in. */
export const load: PageServerLoad = async ({ locals, parent, params }) => {
	const { booksOrganisation } = await parent();
	if (validateRecordId('invoice', params.invoiceId) !== null) error(notFound, noSuchInvoice);
	const document = await findInvoiceDocument(locals.supabase, booksOrganisation.id, params.invoiceId);
	if (document === null) error(notFound, noSuchInvoice);
	return { document, invoicesHref: booksInvoicesPathOf(booksOrganisation.id) };
};
