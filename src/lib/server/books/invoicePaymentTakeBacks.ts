import type { SupabaseClient } from '@supabase/supabase-js';
import { ukClockAt } from '$lib/data/ukClock';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

/** A payment taken back off an invoice: the day and amount it was recorded as, the UK day it was taken back, and the journal that reversed it. */
export type InvoicePaymentTakeBack = { paidOn: string; amount: number; takenBackOn: string; reversalJournalId: string | null };

type TakeBackRow = { paid_on: string; amount: number | string; taken_back_at: string; reversal_journal_id: string | null };

const takeBacksTable = 'books_invoice_payment_takebacks';

/** The payments taken back off the invoice, the earliest taken back first; none until migration 0227 has run. */
export async function findInvoicePaymentTakeBacks(supabase: SupabaseClient, organisationId: string, invoiceId: string): Promise<InvoicePaymentTakeBack[]> {
	const { data, error } = await supabase
		.from(takeBacksTable)
		.select('id, paid_on, amount, taken_back_at, reversal_journal_id')
		.eq('organisation_id', organisationId)
		.eq('invoice_id', invoiceId)
		.order('taken_back_at')
		.order('id');
	if (isSchemaNotYetMigrated(error)) return [];
	if (error !== null) throw error;
	return ((data ?? []) as unknown as TakeBackRow[]).map(fromTakeBackRow);
}

function fromTakeBackRow(row: TakeBackRow): InvoicePaymentTakeBack {
	const takenBackOn = ukClockAt(new Date(row.taken_back_at)).date;
	return { paidOn: row.paid_on, amount: Number(row.amount), takenBackOn, reversalJournalId: row.reversal_journal_id };
}
