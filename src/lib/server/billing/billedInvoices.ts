import type { SupabaseClient } from '@supabase/supabase-js';
import { invoiceSettingDefaults } from '$lib/data/books/booksSettings';
import { isBilled, type BilledInvoice } from '$lib/data/billing/billedInvoice';
import { findBooksSettings } from '$lib/server/books/booksSettings';
import { findInvoiceLines } from '$lib/server/books/invoiceLines';
import { findInvoiceSummaries, type InvoiceSummary } from '$lib/server/books/invoices';
import { invoiceNumberAsPrinted } from '$lib/server/books/invoiceNamings';

/** A customer in Your Business Today's own books that is the client: the books it is in, and its id there. */
type BilledCustomer = { organisationId: string; customerId: string };

type BilledCustomerRow = { organisation_id: string; id: string };

/**
 * Every invoice Your Business Today has raised to the client, newest first. Only its own books link a customer to the
 * clients register (migration 0169), so the customers pointing at the client are found wherever they are. The books
 * are the server's alone to a client, so this reads with the service key: call it only once the caller has been let in
 * to this client, as a contact of theirs on the portal.
 */
export async function findBilledInvoices(service: SupabaseClient, clientId: string): Promise<BilledInvoice[]> {
	const customers = await findBilledCustomers(service, clientId);
	const invoicesOfEach = await Promise.all(customers.map((customer) => findInvoicesOfCustomer(service, customer)));
	return invoicesOfEach.flat().sort(newestFirst);
}

/** The client's invoice with that id, or null when Your Business Today has raised them none with it. */
export async function findBilledInvoice(service: SupabaseClient, clientId: string, invoiceId: string): Promise<BilledInvoice | null> {
	const invoices = await findBilledInvoices(service, clientId);
	return invoices.find((invoice) => invoice.id === invoiceId) ?? null;
}

async function findBilledCustomers(service: SupabaseClient, clientId: string): Promise<BilledCustomer[]> {
	const { data, error } = await service.from('books_customers').select('organisation_id, id').eq('client_id', clientId).order('id');
	if (error !== null) throw error;
	return (data as BilledCustomerRow[]).map((row) => ({ organisationId: row.organisation_id, customerId: row.id }));
}

async function findInvoicesOfCustomer(service: SupabaseClient, customer: BilledCustomer): Promise<BilledInvoice[]> {
	const { organisationId, customerId } = customer;
	const [summaries, settings] = await Promise.all([
		findInvoiceSummaries(service, organisationId, { customerId, status: null }),
		findBooksSettings(service, organisationId)
	]);
	const invoicePrefix = settings?.invoicePrefix ?? invoiceSettingDefaults.invoicePrefix;
	const billed = summaries.filter((summary) => isBilled(summary.status));
	return Promise.all(billed.map((summary) => withLines(service, organisationId, summary, invoicePrefix)));
}

async function withLines(service: SupabaseClient, organisationId: string, summary: InvoiceSummary, invoicePrefix: string): Promise<BilledInvoice> {
	const lines = await findInvoiceLines(service, organisationId, summary.id);
	const { id, status, issueDate, dueDate, reference, total, amountPaid } = summary;
	const printedNumber = invoiceNumberAsPrinted({ invoicePrefix }, summary.invoiceNumber);
	const billedLines = lines.map(({ id: lineId, description, quantity, unitPrice, amount }) => ({ id: lineId, description, quantity, unitPrice, amount }));
	return { id, organisationId, printedNumber, status, issueDate, dueDate, reference, lines: billedLines, total, amountPaid };
}

function newestFirst(first: BilledInvoice, second: BilledInvoice): number {
	return second.issueDate.localeCompare(first.issueDate) || second.printedNumber.localeCompare(first.printedNumber, 'en-GB', { numeric: true });
}
