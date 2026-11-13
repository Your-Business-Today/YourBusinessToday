import type { SupabaseClient } from '@supabase/supabase-js';
import type { BillingPeriod } from '$lib/data/books/billingPeriods';
import type { InvoiceStatus } from '$lib/data/books/invoiceStatuses';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { readEveryPage } from './everyPage';
import { invoicesTable } from './invoiceRecord';
import { billingSchedulesTable } from './billingScheduleRecord';

/** An invoice raised from a billing schedule: which schedule, the period it bills, its number and its status. */
export type ScheduledInvoiceRecord = { invoiceId: string; scheduleId: string; period: BillingPeriod; invoiceNumber: number; status: InvoiceStatus };

type OriginRow = {
	id: string;
	invoice_number: number;
	status: InvoiceStatus;
	billing_schedule_id: string | null;
	period_start: string | null;
	period_end: string | null;
};

const originColumns = 'id, invoice_number, status, billing_schedule_id, period_start, period_end';

/** Every invoice of the organisation raised from a schedule, oldest number first; none until migration 0224 has run. */
export async function findScheduledInvoices(supabase: SupabaseClient, organisationId: string): Promise<ScheduledInvoiceRecord[]> {
	try {
		const rows = await readEveryPage(async (pageStart, pageEnd) => {
			const query = supabase.from(invoicesTable).select(originColumns).eq('organisation_id', organisationId);
			const { data, error } = await query.order('invoice_number').range(pageStart, pageEnd);
			if (error !== null) throw error;
			return data as unknown as OriginRow[];
		});
		return rows.filter((row) => (row.billing_schedule_id ?? null) !== null).map(fromOriginRow);
	} catch (failure) {
		if (isSchemaNotYetMigrated(failure)) return [];
		throw failure;
	}
}

/** The title of each of the organisation's schedules, by id. */
export async function findScheduleTitles(supabase: SupabaseClient, organisationId: string): Promise<Map<string, string>> {
	const { data, error } = await supabase.from(billingSchedulesTable).select('id, title').eq('organisation_id', organisationId);
	if (error !== null) throw error;
	const rows = data as unknown as { id: string; title: string }[];
	return new Map(rows.map((row) => [row.id, row.title]));
}

function fromOriginRow(row: OriginRow): ScheduledInvoiceRecord {
	return {
		invoiceId: row.id,
		scheduleId: String(row.billing_schedule_id),
		period: { start: String(row.period_start), end: String(row.period_end) },
		invoiceNumber: row.invoice_number,
		status: row.status
	};
}
