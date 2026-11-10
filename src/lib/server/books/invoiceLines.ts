import type { SupabaseClient } from '@supabase/supabase-js';
import type { InvoiceLineInput } from '$lib/data/books/invoiceLineRules';
import { fromInvoiceLineRow, invoiceLineColumns, invoiceLinesTable, toInvoiceLineRow, type InvoiceLine, type InvoiceLineRow } from './invoiceRecord';

/** The invoice's lines in the order they print. */
export async function findInvoiceLines(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<InvoiceLine[]> {
	const { data, error } = await supabase
		.from(invoiceLinesTable)
		.select(invoiceLineColumns)
		.eq('organisation_id', organisationId)
		.eq('invoice_id', invoiceId)
		.order('position')
		.order('id');
	if (error !== null) throw error;
	return (data as unknown as InvoiceLineRow[]).map(fromInvoiceLineRow);
}

/** Keeps the lines on the invoice in the order given, and answers the id of each. */
export async function insertInvoiceLines(supabase: SupabaseClient, organisationId: string, invoiceId: string, lines: InvoiceLineInput[]): Promise<string[]> {
	const rows = lines.map((line, position) => toInvoiceLineRow(organisationId, invoiceId, line, position));
	const { data, error } = await supabase.from(invoiceLinesTable).insert(rows).select('id');
	if (error !== null) throw error;
	return (data as { id: string }[]).map((row) => row.id);
}

/** Whether the invoice holds the line with that id: the sign that the step which put it there happened. */
export async function isInvoiceLineKept(supabase: SupabaseClient, organisationId: string, invoiceId: string, lineId: string): Promise<boolean> {
	const { data, error } = await supabase.from(invoiceLinesTable).select('id').eq('organisation_id', organisationId).eq('invoice_id', invoiceId).eq('id', lineId);
	if (error !== null) throw error;
	return (data ?? []).length > 0;
}
