import type { SupabaseClient } from '@supabase/supabase-js';
import { validateBillingScheduleChange } from '$lib/data/books/billingScheduleRules';
import type { BillingScheduleChange } from '$lib/data/books/billingSchedule';
import type { InvoiceLineInput } from '$lib/data/books/invoiceLineRules';
import { ukClockAt } from '$lib/data/ukClock';
import { validateRecordId } from '$lib/data/isUuid';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { invoiceTargetRefusal } from './invoiceTargets';
import { findBillingSchedule } from './billingSchedules';
import { titleTakenMeanwhileRefusal, titleTakenRefusal } from './billingScheduleTitles';
import { billingSchedulesTable, toScheduleLineRow, toSettingColumns, type BillingSchedule } from './billingScheduleRecord';

const replaceLinesStep = 'replace_books_billing_schedule_lines';

/**
 * Changes only what was given of one of the organisation's billing schedules: a setting, pausing or resuming it, its
 * last date, or every line at once. Everything left out keeps what the schedule holds, and an invoice already raised
 * from it is never touched. Any value its columns cannot hold is refused before anything is written.
 */
export async function changeBillingSchedule(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<void> {
	const change = validateBillingScheduleChange(fields, ukClockAt(new Date()).date);
	if (typeof change === 'string') throw new BooksRefusal(change);
	const schedule = await findScheduleToChange(supabase, organisationId, fields.scheduleId);
	refuseWhen(await invoiceTargetRefusal(supabase, organisationId, { lines: change.lines }));
	if (change.title !== undefined) {
		refuseWhen(await titleTakenRefusal(supabase, organisationId, { customerId: schedule.customerId, title: change.title, scheduleId: schedule.id }));
	}
	await changeSettings(supabase, organisationId, schedule, change);
	if (change.lines === undefined) return;
	await replaceLines(supabase, organisationId, schedule, change.lines);
}

async function findScheduleToChange(supabase: SupabaseClient, organisationId: string, scheduleId: unknown): Promise<BillingSchedule> {
	refuseWhen(validateRecordId('billing schedule', String(scheduleId ?? '')));
	const schedule = await findBillingSchedule(supabase, organisationId, scheduleId as string);
	if (schedule !== null) return schedule;
	throw new BooksRefusal(`No billing schedule ${scheduleId} is in this organisation's books; list_billing_schedules lists them.`);
}

async function changeSettings(supabase: SupabaseClient, organisationId: string, schedule: BillingSchedule, change: BillingScheduleChange): Promise<void> {
	const columns = toSettingColumns(change);
	const isSettingChanged = Object.keys(columns).length > 0;
	if (!isSettingChanged) return;
	const { error } = await supabase
		.from(billingSchedulesTable)
		.update({ ...columns, updated_at: new Date().toISOString() })
		.eq('organisation_id', organisationId)
		.eq('id', schedule.id);
	if (error === null) return;
	refuseWhen(titleTakenMeanwhileRefusal(error, String(change.title)));
	throw error;
}

async function replaceLines(supabase: SupabaseClient, organisationId: string, schedule: BillingSchedule, lines: InvoiceLineInput[]): Promise<void> {
	const inputs = { target_organisation_id: organisationId, target_schedule_id: schedule.id, new_lines: lines.map(toScheduleLineRow) };
	const { data, error } = await supabase.rpc(replaceLinesStep, inputs);
	if (error !== null) throw error;
	if (data === true) return;
	throw new BooksRefusal(`The billing schedule "${schedule.title}" left the books while it was being changed; list_billing_schedules lists what is there.`);
}
