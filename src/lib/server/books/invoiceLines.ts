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

/**
 * Puts the lines given in place of the ones the draft held. The new lines are kept before the old ones are taken
 * away, and when the old ones cannot be taken away the new ones are, so the draft never holds no lines or both sets.
 */
export async function replaceInvoiceLines(
	supabase: SupabaseClient,
	organisationId: string,
	invoiceId: string,
	lines: InvoiceLineInput[]
): Promise<void> {
	const heldLines = await findInvoiceLines(supabase, organisationId, invoiceId);
	const newLineIds = await insertInvoiceLines(supabase, organisationId, invoiceId, lines);
	const error = await deleteLines(supabase, organisationId, invoiceId, heldLines.map((line) => line.id));
	if (error === null) return;
	await deleteLines(supabase, organisationId, invoiceId, newLineIds);
	throw error;
}

async function deleteLines(supabase: SupabaseClient, organisationId: string, invoiceId: string, lineIds: string[]) {
	if (lineIds.length === 0) return null;
	const { error } = await supabase.from(invoiceLinesTable).delete().eq('organisation_id', organisationId).eq('invoice_id', invoiceId).in('id', lineIds);
	return error;
}
