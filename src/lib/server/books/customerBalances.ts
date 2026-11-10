import type { SupabaseClient } from '@supabase/supabase-js';
import { balanceOf, balancesOfCustomers, invoiceLineTotal, type CustomerBalance, type InvoiceAmount, type InvoiceStanding } from '$lib/data/books/customerBalance';
import { InvoiceStatuses, type InvoiceStatus } from '$lib/data/books/invoiceStatuses';
import { readEveryPage } from './everyPage';
import { findCustomers } from './customers';
import type { Customer } from './customerRecord';

export type CustomerWithBalance = { customer: Customer; balance: CustomerBalance };

type InvoiceRow = { id: string; customer_id: string; status: InvoiceStatus };
type LineRow = { invoice_id: string; quantity: number | string; unit_price: number | string };
type PaymentRow = { invoice_id: string; amount: number | string };

const onIssuedInvoices = 'books_invoices!inner(status)';
const issuedStatusColumn = 'books_invoices.status';

/** Every customer of the organisation by name, each with what it has been invoiced and what it still owes. */
export async function findCustomerBalances(supabase: SupabaseClient, organisationId: string): Promise<CustomerWithBalance[]> {
	const [customers, invoices, lineTotals, payments] = await Promise.all([
		findCustomers(supabase, organisationId),
		readRows<InvoiceRow>(supabase, organisationId, 'books_invoices', 'id, customer_id, status', false),
		readRows<LineRow>(supabase, organisationId, 'books_invoice_lines', `id, invoice_id, quantity, unit_price, ${onIssuedInvoices}`, true),
		readRows<PaymentRow>(supabase, organisationId, 'books_invoice_payments', `id, invoice_id, amount, ${onIssuedInvoices}`, true)
	]);
	const balances = balancesOfCustomers(invoices.map(toInvoiceStanding), lineTotals.map(toLineTotal), payments.map(toPayment));
	return customers.map((customer) => ({ customer, balance: balanceOf(balances, customer.id) }));
}

async function readRows<Row>(supabase: SupabaseClient, organisationId: string, table: string, columns: string, isOnIssuedOnly: boolean): Promise<Row[]> {
	return readEveryPage(async (pageStart, pageEnd) => {
		const query = supabase.from(table).select(columns).eq('organisation_id', organisationId);
		const narrowed = isOnIssuedOnly ? query.eq(issuedStatusColumn, InvoiceStatuses.issued) : query;
		const { data, error } = await narrowed.order('id').range(pageStart, pageEnd);
		if (error !== null) throw error;
		return data as unknown as Row[];
	});
}

function toInvoiceStanding(row: InvoiceRow): InvoiceStanding {
	return { id: row.id, customerId: row.customer_id, status: row.status };
}

function toLineTotal(row: LineRow): InvoiceAmount {
	return { invoiceId: row.invoice_id, amount: invoiceLineTotal(Number(row.quantity), Number(row.unit_price)) };
}

function toPayment(row: PaymentRow): InvoiceAmount {
	return { invoiceId: row.invoice_id, amount: Number(row.amount) };
}
