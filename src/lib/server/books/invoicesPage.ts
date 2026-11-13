import type { SupabaseClient } from '@supabase/supabase-js';
import type { InvoicesPage } from '$lib/data/books/page/invoicesPage';
import { findBillingSchedules } from './billingSchedules';
import { findCustomerBalances } from './customerBalances';
import { customerRowsOf, scheduleRowOf } from './customerRows';
import { findInvoiceNamings } from './invoiceNamings';
import { invoiceRowOf } from './invoiceRows';
import { findInvoiceSummaries } from './invoices';
import { findLastSentTimes } from './invoiceSendings';

/**
 * The books' own tables are read as the signed-in person; the sendings and schedules, which keep no policy,
 * with the service client, which the caller passes only after the Books page's access check.
 */
export type InvoicesPageClients = { asPerson: SupabaseClient; afterAccessCheck: SupabaseClient };

const everyInvoice = { customerId: null, status: null };
const everySchedule = { customerId: null };

/** Everything the Invoices page lists for the organisation, read on the day given. */
export async function readInvoicesPage(clients: InvoicesPageClients, organisationId: string, today: string): Promise<InvoicesPage> {
	const { asPerson, afterAccessCheck } = clients;
	const [namings, invoices, lastSentTimes, customers, schedules] = await Promise.all([
		findInvoiceNamings(asPerson, organisationId),
		findInvoiceSummaries(asPerson, organisationId, everyInvoice),
		findLastSentTimes(afterAccessCheck, organisationId),
		findCustomerBalances(asPerson, organisationId),
		findBillingSchedules(afterAccessCheck, organisationId, everySchedule)
	]);
	return {
		invoices: invoices.map((invoice) => invoiceRowOf(invoice, { namings, lastSentTimes, today })),
		customers: customerRowsOf(customers),
		schedules: schedules.map((schedule) => scheduleRowOf(schedule, namings))
	};
}
