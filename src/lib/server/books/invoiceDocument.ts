import type { SupabaseClient } from '@supabase/supabase-js';
import { invoiceSettingDefaults } from '$lib/data/books/booksSettings';
import type { InvoiceDocument } from '$lib/data/books/invoiceDocument';
import { invoiceDocumentOf } from '$lib/data/books/invoiceDocumentOf';
import { blankOrganisationDetails } from '$lib/data/organisationRules';
import { getOrganisation } from '$lib/server/organisations/getOrganisation';
import { findBooksSettings } from './booksSettings';
import { findCustomer } from './customers';
import { findInvoiceInFull } from './invoices';
import { invoiceNumberAsPrinted } from './invoiceNamings';

/**
 * The invoice as a document, drawn from the organisation's books and its Details, or null when its books hold no
 * invoice with that id. It reads with the client it is given, so the caller decides who may see the books.
 */
export async function findInvoiceDocument(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<InvoiceDocument | null> {
	const invoice = await findInvoiceInFull(supabase, organisationId, invoiceId);
	if (invoice === null) return null;
	const [settings, organisation, customer] = await Promise.all([
		findBooksSettings(supabase, organisationId),
		getOrganisation(supabase, organisationId),
		findCustomer(supabase, organisationId, invoice.customerId)
	]);
	const invoicePrefix = settings?.invoicePrefix ?? invoiceSettingDefaults.invoicePrefix;
	const printedNumber = invoiceNumberAsPrinted({ invoicePrefix }, invoice.invoiceNumber);
	const seller = organisation ?? blankOrganisationDetails;
	return invoiceDocumentOf({ invoice: { ...invoice, printedNumber }, settings, seller, customer });
}
