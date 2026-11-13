import type { SupabaseClient } from '@supabase/supabase-js';
import { booksInvoicePathOf } from '$lib/data/books/page/booksPaths';
import type { BilledOrganisationInvoice } from '$lib/data/books/organisationBilling';
import { findInvoiceSummaries } from '../invoices';
import { findSentInvoiceIds } from '../invoiceSendings';
import { invoiceNumberAsPrinted } from '../invoiceNamings';
import type { OwnBooks } from '../ownBooks';

/** Every invoice the books have raised to the customer, newest number first, each opening as its document. */
export async function findBilledOrganisationInvoices(
	service: SupabaseClient,
	books: OwnBooks,
	customer: { id: string; invoicePrefix: string }
): Promise<BilledOrganisationInvoice[]> {
	const [summaries, sentInvoiceIds] = await Promise.all([
		findInvoiceSummaries(service, books.id, { customerId: customer.id, status: null }),
		findSentInvoiceIds(service, books.id)
	]);
	return summaries.map((summary) => ({
		id: summary.id,
		printedNumber: invoiceNumberAsPrinted(customer, summary.invoiceNumber),
		issueDate: summary.issueDate,
		reference: summary.reference,
		total: summary.total,
		status: summary.status,
		isSent: sentInvoiceIds.has(summary.id),
		documentHref: booksInvoicePathOf(books.id, summary.id)
	}));
}
