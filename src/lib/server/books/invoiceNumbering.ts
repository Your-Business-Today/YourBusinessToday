import type { SupabaseClient } from '@supabase/supabase-js';
import { booksSettingsTable } from '$lib/data/books/booksSettings';

/** Why the next invoice number would repeat one the organisation's books already hold, or null when it would not. */
export async function invoiceNumberingRefusal(
	supabase: SupabaseClient,
	organisationId: string,
	nextInvoiceNumber: number | undefined
): Promise<string | null> {
	if (nextInvoiceNumber === undefined) return null;
	const highestInvoiceNumber = await findHighestInvoiceNumber(supabase, organisationId);
	if (highestInvoiceNumber === null || nextInvoiceNumber > highestInvoiceNumber) return null;
	return (
		`nextInvoiceNumber must be above ${highestInvoiceNumber}, the highest invoice number already in these books, ` +
		`so no two invoices share a number; ${nextInvoiceNumber} was given.`
	);
}

async function findHighestInvoiceNumber(supabase: SupabaseClient, organisationId: string): Promise<number | null> {
	const { data, error } = await supabase
		.from('books_invoices')
		.select('invoice_number')
		.eq('organisation_id', organisationId)
		.order('invoice_number', { ascending: false })
		.limit(1)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return (data as { invoice_number: number }).invoice_number;
}

/** The number the next invoice takes: the numbering's next number, or one above the highest the books hold when that is higher. */
export async function findNextInvoiceNumber(supabase: SupabaseClient, organisationId: string, numberingNext: number): Promise<number> {
	const highestInvoiceNumber = await findHighestInvoiceNumber(supabase, organisationId);
	if (highestInvoiceNumber === null) return numberingNext;
	return Math.max(numberingNext, highestInvoiceNumber + 1);
}

/** Moves the organisation's numbering on past the number just used, and never back; a first invoice makes its settings row. */
export async function advanceInvoiceNumbering(supabase: SupabaseClient, organisationId: string, usedNumber: number): Promise<void> {
	const advanced = { next_invoice_number: usedNumber + 1, updated_at: new Date().toISOString() };
	const { data, error } = await supabase
		.from(booksSettingsTable)
		.update(advanced)
		.eq('organisation_id', organisationId)
		.lte('next_invoice_number', usedNumber)
		.select('organisation_id');
	if (error !== null) throw error;
	const advancedRows = data ?? [];
	const isAdvanced = advancedRows.length > 0;
	if (isAdvanced) return;
	const firstSettings = { organisation_id: organisationId, ...advanced };
	const { error: insertError } = await supabase.from(booksSettingsTable).upsert(firstSettings, { onConflict: 'organisation_id', ignoreDuplicates: true });
	if (insertError !== null) throw insertError;
}
