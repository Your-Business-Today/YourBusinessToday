import type { SupabaseClient } from '@supabase/supabase-js';
import type { InvoicePaymentInput } from '$lib/data/books/invoiceMoveRules';

/** Money received against an invoice, as kept. */
export type InvoicePayment = InvoicePaymentInput & { id: string };

type InvoicePaymentRow = { id: string; paid_on: string; amount: number | string };

const invoicePaymentsTable = 'books_invoice_payments';

/** The payments recorded against the invoice, the earliest first. */
export async function findInvoicePayments(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<InvoicePayment[]> {
	const { data, error } = await supabase
		.from(invoicePaymentsTable)
		.select('id, paid_on, amount')
		.eq('organisation_id', organisationId)
		.eq('invoice_id', invoiceId)
		.order('paid_on')
		.order('id');
	if (error !== null) throw error;
	return (data as unknown as InvoicePaymentRow[]).map((row) => ({ id: row.id, paidOn: row.paid_on, amount: Number(row.amount) }));
}
