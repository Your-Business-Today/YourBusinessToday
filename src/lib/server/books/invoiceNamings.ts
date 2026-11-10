import type { SupabaseClient } from '@supabase/supabase-js';
import { invoiceSettingDefaults } from '$lib/data/books/booksSettings';
import { findBooksSettings } from './booksSettings';
import { findChartOfAccounts } from './chartOfAccounts';
import { findCustomers } from './customers';

/** What an invoice's ids are called in the organisation's books, so an invoice reads as the person knows it. */
export type InvoiceNamings = {
	invoicePrefix: string;
	customerNames: Map<string, string>;
	accountNames: Map<string, string>;
	costCentreNames: Map<string, string>;
};

/** The invoice prefix, and the names of the organisation's customers, accounts and cost centres by id. */
export async function findInvoiceNamings(supabase: SupabaseClient, organisationId: string): Promise<InvoiceNamings> {
	const [settings, customers, chart] = await Promise.all([
		findBooksSettings(supabase, organisationId),
		findCustomers(supabase, organisationId),
		findChartOfAccounts(supabase, organisationId)
	]);
	return {
		invoicePrefix: settings?.invoicePrefix ?? invoiceSettingDefaults.invoicePrefix,
		customerNames: new Map(customers.map((customer) => [customer.id, customer.name])),
		accountNames: new Map(chart.accounts.map((account) => [account.id, `${account.code} ${account.name}`])),
		costCentreNames: new Map(chart.costCentres.map((costCentre) => [costCentre.id, costCentre.name]))
	};
}

/** The name the organisation's books give the customer, or its id when they no longer hold it. */
export function customerNameOf(namings: InvoiceNamings, customerId: string): string {
	return namings.customerNames.get(customerId) ?? `customer ${customerId}`;
}

/** The number as it prints on the invoice, such as INV-7. */
export function invoiceNumberAsPrinted(namings: InvoiceNamings, invoiceNumber: number): string {
	return `${namings.invoicePrefix}-${invoiceNumber}`;
}
