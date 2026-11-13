import type { SupabaseClient } from '@supabase/supabase-js';
import { booksInvoiceAddressOf } from '$lib/data/books/page/booksPaths';
import { BooksRefusal } from '$lib/server/books/booksRefusal';
import { findInvoiceInFull } from '$lib/server/books/invoices';
import { findInvoiceNamings } from '$lib/server/books/invoiceNamings';
import { findInvoiceSendings } from '$lib/server/books/invoiceSendings';
import { findInvoicePaymentTakeBacks } from '$lib/server/books/invoicePaymentTakeBacks';
import { findScheduledInvoices, findScheduleTitles } from '$lib/server/books/scheduledInvoices';
import { describeInvoiceInFull } from './describeInvoices';
import { describeSendings } from './describeInvoiceSendings';
import { describeInvoiceOrigin } from './describeScheduledInvoices';
import { describeTakeBacks } from './describeInvoiceTakeBacks';

/**
 * The invoice in full as the person knows it, with any payment taken back off it, every time it was emailed and the
 * address it opens at as a document, or a refusal when the organisation's books hold none with that id.
 */
export async function readInvoiceInFull(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<string> {
	const [invoice, namings, sendings, origin, takeBacks] = await Promise.all([
		findInvoiceInFull(supabase, organisationId, invoiceId),
		findInvoiceNamings(supabase, organisationId),
		findInvoiceSendings(supabase, organisationId, invoiceId),
		findOrigin(supabase, organisationId, invoiceId),
		findInvoicePaymentTakeBacks(supabase, organisationId, invoiceId)
	]);
	if (invoice === null) throw new BooksRefusal(`No invoice ${invoiceId} is in this organisation's books; list_invoices lists them.`);
	const document = `Opens as a document at ${booksInvoiceAddressOf(organisationId, invoiceId)}`;
	const described = [describeInvoiceInFull(invoice, namings), ...describeTakeBacks(takeBacks), ...origin];
	return [...described, ...describeSendings(invoice.status, sendings), document].join('\n');
}

/** Where the invoice came from when a billing schedule raised it, as a line of its own, or no line. */
async function findOrigin(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<string[]> {
	const scheduled = await findScheduledInvoices(supabase, organisationId);
	const record = scheduled.find((candidate) => candidate.invoiceId === invoiceId);
	if (record === undefined) return [];
	const titles = await findScheduleTitles(supabase, organisationId);
	const origin = describeInvoiceOrigin(record, titles);
	return [`Raised ${origin}`];
}
