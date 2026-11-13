import type { SupabaseClient } from '@supabase/supabase-js';
import type { InvoiceSending } from '$lib/data/books/invoiceSendingRules';
import { emailDeliveries, type EmailDelivery } from '$lib/data/emailDelivery';
import { readEveryPage } from './everyPage';

/** One time an invoice of the organisation was emailed, to keep. */
export type NewInvoiceSending = { organisationId: string; invoiceId: string; sentTo: string; delivery: EmailDelivery; sentByAccountId: string | null };

type SendingRow = { invoice_id: string; sent_to: string; delivery: EmailDelivery; sent_by: string | null; sent_at: string };

const sendingsTable = 'books_invoice_sendings';

const sendingColumns = 'id, invoice_id, sent_to, delivery, sent_by, sent_at';

/** Keeps one sending of an invoice, whatever became of the email. */
export async function keepInvoiceSending(supabase: SupabaseClient, sending: NewInvoiceSending): Promise<void> {
	const row = {
		organisation_id: sending.organisationId,
		invoice_id: sending.invoiceId,
		sent_to: sending.sentTo,
		delivery: sending.delivery,
		sent_by: sending.sentByAccountId
	};
	const { error } = await supabase.from(sendingsTable).insert(row);
	if (error !== null) throw error;
}

/** Every time the invoice was emailed, oldest first. */
export async function findInvoiceSendings(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<InvoiceSending[]> {
	const rows = await readEveryPage(async (pageStart, pageEnd) => {
		const query = supabase.from(sendingsTable).select(sendingColumns).eq('organisation_id', organisationId).eq('invoice_id', invoiceId);
		const { data, error } = await query.order('sent_at').order('id').range(pageStart, pageEnd);
		if (error !== null) throw error;
		return data as unknown as SendingRow[];
	});
	return rows.map(fromSendingRow);
}

/** The organisation's invoices whose email reached the sender at least once. */
export async function findSentInvoiceIds(supabase: SupabaseClient, organisationId: string): Promise<Set<string>> {
	const rows = await readEveryPage(async (pageStart, pageEnd) => {
		const query = supabase.from(sendingsTable).select(sendingColumns).eq('organisation_id', organisationId).eq('delivery', emailDeliveries.sent);
		const { data, error } = await query.order('id').range(pageStart, pageEnd);
		if (error !== null) throw error;
		return data as unknown as SendingRow[];
	});
	return new Set(rows.map((row) => row.invoice_id));
}

function fromSendingRow(row: SendingRow): InvoiceSending {
	return { sentTo: row.sent_to, delivery: row.delivery, sentByAccountId: row.sent_by, sentAt: row.sent_at };
}

/** How each invoice's sendings stand: whether one went, and how many tries did not. */
export type SendingTally = { hasGone: boolean; triesNotGone: number };

/** The tally of every sending of the invoices given, by invoice; an invoice never sent is not in it. */
export async function findSendingTallies(supabase: SupabaseClient, organisationId: string, invoiceIds: string[]): Promise<Map<string, SendingTally>> {
	const tallies = new Map<string, SendingTally>();
	if (invoiceIds.length === 0) return tallies;
	const query = supabase.from(sendingsTable).select(sendingColumns).eq('organisation_id', organisationId).in('invoice_id', invoiceIds);
	const { data, error } = await query.order('id');
	if (error !== null) throw error;
	for (const row of data as unknown as SendingRow[]) {
		const tally = tallies.get(row.invoice_id) ?? { hasGone: false, triesNotGone: 0 };
		const hasGone = row.delivery === emailDeliveries.sent;
		tallies.set(row.invoice_id, { hasGone: tally.hasGone || hasGone, triesNotGone: tally.triesNotGone + (hasGone ? 0 : 1) });
	}
	return tallies;
}
