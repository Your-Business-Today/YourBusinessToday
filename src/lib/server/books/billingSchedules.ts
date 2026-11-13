import type { SupabaseClient } from '@supabase/supabase-js';
import type { InvoiceLine } from './invoiceRecord';
import { fromInvoiceLineRow } from './invoiceRecord';
import {
	billingScheduleColumns,
	billingScheduleLineColumns,
	billingScheduleLinesTable,
	billingSchedulesTable,
	fromBillingScheduleRow,
	type BillingSchedule,
	type BillingScheduleLineRow,
	type BillingScheduleRow
} from './billingScheduleRecord';

/** Which schedules to read: every one in the books, or one customer's. */
export type BillingScheduleFilter = { customerId: string | null };

/** The organisation's schedules, by customer and title, each with its lines in the order they print. */
export async function findBillingSchedules(supabase: SupabaseClient, organisationId: string, filter: BillingScheduleFilter): Promise<BillingSchedule[]> {
	let query = supabase.from(billingSchedulesTable).select(billingScheduleColumns).eq('organisation_id', organisationId);
	if (filter.customerId !== null) query = query.eq('customer_id', filter.customerId);
	const { data, error } = await query.order('customer_id').order('title');
	if (error !== null) throw error;
	const rows = data as unknown as BillingScheduleRow[];
	const linesBySchedule = await findLinesBySchedule(supabase, organisationId, rows.map((row) => row.id));
	return rows.map((row) => fromBillingScheduleRow(row, linesBySchedule.get(row.id) ?? []));
}

/** The organisation's schedule with that id, with its lines, or null when its books hold none. */
export async function findBillingSchedule(supabase: SupabaseClient, organisationId: string, scheduleId: string): Promise<BillingSchedule | null> {
	const query = supabase.from(billingSchedulesTable).select(billingScheduleColumns).eq('organisation_id', organisationId).eq('id', scheduleId);
	const { data, error } = await query.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	const linesBySchedule = await findLinesBySchedule(supabase, organisationId, [scheduleId]);
	return fromBillingScheduleRow(data as unknown as BillingScheduleRow, linesBySchedule.get(scheduleId) ?? []);
}

async function findLinesBySchedule(supabase: SupabaseClient, organisationId: string, scheduleIds: string[]): Promise<Map<string, InvoiceLine[]>> {
	const linesBySchedule = new Map<string, InvoiceLine[]>();
	if (scheduleIds.length === 0) return linesBySchedule;
	const { data, error } = await supabase
		.from(billingScheduleLinesTable)
		.select(billingScheduleLineColumns)
		.eq('organisation_id', organisationId)
		.in('schedule_id', scheduleIds)
		.order('position')
		.order('id');
	if (error !== null) throw error;
	for (const row of data as unknown as BillingScheduleLineRow[]) {
		linesBySchedule.set(row.schedule_id, [...(linesBySchedule.get(row.schedule_id) ?? []), fromInvoiceLineRow(row)]);
	}
	return linesBySchedule;
}
