import type { SupabaseClient } from '@supabase/supabase-js';
import { invoiceSettingDefaults } from '$lib/data/books/booksSettings';
import { findBillingSchedules } from './billingSchedules';
import type { BillingSchedule } from './billingScheduleRecord';
import { findBooksSettings } from './booksSettings';
import type { Customer } from './customerRecord';
import { findCustomers } from './customers';
import { invoiceNumberAsPrinted } from './invoiceNamings';
import { findScheduledInvoices, type ScheduledInvoiceRecord } from './scheduledInvoices';

/** What a run reads of one organisation's books before it moves anything. */
export type BooksForRun = {
	schedules: BillingSchedule[];
	customers: Map<string, Customer>;
	scheduledInvoices: ScheduledInvoiceRecord[];
	paymentTermsDays: number;
	invoicePrefix: string;
};

/** The organisation's schedules, customers, invoices raised from schedules and the settings an invoice takes. */
export async function readBooksForRun(supabase: SupabaseClient, organisationId: string): Promise<BooksForRun> {
	const [schedules, customers, scheduledInvoices, settings] = await Promise.all([
		findBillingSchedules(supabase, organisationId, { customerId: null }),
		findCustomers(supabase, organisationId),
		findScheduledInvoices(supabase, organisationId),
		findBooksSettings(supabase, organisationId)
	]);
	return {
		schedules,
		customers: new Map(customers.map((customer) => [customer.id, customer])),
		scheduledInvoices,
		paymentTermsDays: settings?.paymentTermsDays ?? invoiceSettingDefaults.paymentTermsDays,
		invoicePrefix: settings?.invoicePrefix ?? invoiceSettingDefaults.invoicePrefix
	};
}

/** The invoice number as it prints in these books, such as INV-8. */
export function printedNumberIn(books: BooksForRun, invoiceNumber: number): string {
	return invoiceNumberAsPrinted(books, invoiceNumber);
}

/** The customer's name in these books, or its id when they no longer hold it. */
export function customerNameIn(books: BooksForRun, customerId: string): string {
	return books.customers.get(customerId)?.name ?? `customer ${customerId}`;
}
