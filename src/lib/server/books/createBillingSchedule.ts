import type { SupabaseClient } from '@supabase/supabase-js';
import { validateNewBillingSchedule } from '$lib/data/books/billingScheduleRules';
import type { NewBillingSchedule } from '$lib/data/books/billingSchedule';
import { ukClockAt } from '$lib/data/ukClock';
import { validateRecordId } from '$lib/data/isUuid';
import { BooksRefusal, refuseWhen } from './booksRefusal';
import { invoiceTargetRefusal } from './invoiceTargets';
import { titleTakenMeanwhileRefusal, titleTakenRefusal } from './billingScheduleTitles';
import { billingScheduleLinesTable, billingSchedulesTable, toScheduleLineRow, toSettingColumns } from './billingScheduleRecord';

/**
 * Sets up what one of the organisation's customers is billed again and again, and answers the schedule's id. Every
 * setting and line is refused with its reason before anything is written, and lines that fail to save take the
 * schedule with them. Nothing is raised from it here.
 */
export async function createBillingSchedule(supabase: SupabaseClient, organisationId: string, fields: Record<string, unknown>): Promise<string> {
	refuseWhen(validateRecordId('organisation', organisationId));
	const schedule = validateNewBillingSchedule(fields, ukClockAt(new Date()).date);
	if (typeof schedule === 'string') throw new BooksRefusal(schedule);
	refuseWhen(await invoiceTargetRefusal(supabase, organisationId, schedule));
	refuseWhen(await titleTakenRefusal(supabase, organisationId, { ...schedule, scheduleId: null }));
	const scheduleId = await insertSchedule(supabase, organisationId, schedule);
	await keepLinesOrWithdraw(supabase, organisationId, scheduleId, schedule);
	return scheduleId;
}

async function insertSchedule(supabase: SupabaseClient, organisationId: string, schedule: NewBillingSchedule): Promise<string> {
	const row = { organisation_id: organisationId, customer_id: schedule.customerId, ...toSettingColumns(schedule) };
	const { data, error } = await supabase.from(billingSchedulesTable).insert(row).select('id').single();
	if (error !== null) {
		refuseWhen(titleTakenMeanwhileRefusal(error, schedule.title));
		throw error;
	}
	return (data as { id: string }).id;
}

async function keepLinesOrWithdraw(supabase: SupabaseClient, organisationId: string, scheduleId: string, schedule: NewBillingSchedule): Promise<void> {
	const rows = schedule.lines.map((line, position) => ({ organisation_id: organisationId, schedule_id: scheduleId, ...toScheduleLineRow(line), position }));
	const { error } = await supabase.from(billingScheduleLinesTable).insert(rows);
	if (error === null) return;
	await supabase.from(billingSchedulesTable).delete().eq('organisation_id', organisationId).eq('id', scheduleId);
	throw error;
}
