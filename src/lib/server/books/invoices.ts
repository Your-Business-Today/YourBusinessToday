import type { SupabaseClient } from '@supabase/supabase-js';
import { invoiceLineTotal, sumByInvoice, type InvoiceAmount } from '$lib/data/books/customerBalance';
import { sumMoney } from '$lib/data/books/money';
import type { InvoiceStatus } from '$lib/data/books/invoiceStatuses';
import { readEveryPage } from './everyPage';
import { findInvoiceLines } from './invoiceLines';
import { fromInvoiceHeaderRow, invoiceHeaderColumns, invoicesTable, type InvoiceHeader, type InvoiceHeaderRow, type InvoiceLine } from './invoiceRecord';

/** An invoice with what its lines come to and what has been paid on it. */
export type InvoiceSummary = InvoiceHeader & { total: number; amountPaid: number };

/** An invoice in full: its summary and every line, in the order they print. */
export type InvoiceInFull = InvoiceSummary & { lines: InvoiceLine[] };

/** Which invoices a list holds: one customer's, or those in one status, or all of them when both are null. */
export type InvoiceFilter = { customerId: string | null; status: InvoiceStatus | null };

type LineRow = { invoice_id: string; quantity: number | string; unit_price: number | string };
type PaymentRow = { invoice_id: string; amount: number | string };

/** Where the amounts held against invoices are read from, and what each row comes to. */
type AmountSource<Row> = { table: string; columns: string; toAmount: (row: Row) => InvoiceAmount };

const lineTotals: AmountSource<LineRow> = {
	table: 'books_invoice_lines',
	columns: 'id, invoice_id, quantity, unit_price',
	toAmount: (row) => ({ invoiceId: row.invoice_id, amount: invoiceLineTotal(Number(row.quantity), Number(row.unit_price)) })
};

const payments: AmountSource<PaymentRow> = {
	table: 'books_invoice_payments',
	columns: 'id, invoice_id, amount',
	toAmount: (row) => ({ invoiceId: row.invoice_id, amount: Number(row.amount) })
};

/** The invoice as the organisation's books hold it, without its lines, or null when they hold none with that id. */
export async function findInvoiceHeader(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<InvoiceHeader | null> {
	const { data, error } = await supabase.from(invoicesTable).select(invoiceHeaderColumns).eq('organisation_id', organisationId).eq('id', invoiceId).maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return fromInvoiceHeaderRow(data as unknown as InvoiceHeaderRow);
}

/** The invoice with every line and what has been paid on it, or null when the books hold none with that id. */
export async function findInvoiceInFull(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<InvoiceInFull | null> {
	const header = await findInvoiceHeader(supabase, organisationId, invoiceId);
	if (header === null) return null;
	const [lines, paid] = await Promise.all([
		findInvoiceLines(supabase, organisationId, invoiceId),
		readAmounts(supabase, organisationId, payments, invoiceId)
	]);
	const total = sumMoney(lines.map((line) => line.amount));
	return { ...header, lines, total, amountPaid: sumMoney(paid.map((payment) => payment.amount)) };
}

/** The organisation's invoices the filter lets through, newest number first, each with its total and what has been paid. */
export async function findInvoiceSummaries(supabase: SupabaseClient, organisationId: string, filter: InvoiceFilter): Promise<InvoiceSummary[]> {
	const [headers, lineAmounts, paidAmounts] = await Promise.all([
		findInvoiceHeaders(supabase, organisationId, filter),
		readAmounts(supabase, organisationId, lineTotals, null),
		readAmounts(supabase, organisationId, payments, null)
	]);
	const totals = sumByInvoice(lineAmounts);
	const paid = sumByInvoice(paidAmounts);
	return headers.map((header) => ({ ...header, total: totals.get(header.id) ?? 0, amountPaid: paid.get(header.id) ?? 0 }));
}

async function findInvoiceHeaders(supabase: SupabaseClient, organisationId: string, filter: InvoiceFilter): Promise<InvoiceHeader[]> {
	const rows = await readEveryPage(async (pageStart, pageEnd) => {
		const query = supabase.from(invoicesTable).select(invoiceHeaderColumns).eq('organisation_id', organisationId);
		const ofCustomer = filter.customerId === null ? query : query.eq('customer_id', filter.customerId);
		const inStatus = filter.status === null ? ofCustomer : ofCustomer.eq('status', filter.status);
		const { data, error } = await inStatus.order('invoice_number', { ascending: false }).range(pageStart, pageEnd);
		if (error !== null) throw error;
		return data as unknown as InvoiceHeaderRow[];
	});
	return rows.map(fromInvoiceHeaderRow);
}

async function readAmounts<Row>(supabase: SupabaseClient, organisationId: string, source: AmountSource<Row>, invoiceId: string | null): Promise<InvoiceAmount[]> {
	const rows = await readEveryPage(async (pageStart, pageEnd) => {
		const query = supabase.from(source.table).select(source.columns).eq('organisation_id', organisationId);
		const ofInvoice = invoiceId === null ? query : query.eq('invoice_id', invoiceId);
		const { data, error } = await ofInvoice.order('id').range(pageStart, pageEnd);
		if (error !== null) throw error;
		return data as unknown as Row[];
	});
	return rows.map(source.toAmount);
}
