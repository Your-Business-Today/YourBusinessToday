import type { SupabaseClient } from '@supabase/supabase-js';

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
