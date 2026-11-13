import type { SupabaseClient } from '@supabase/supabase-js';
import { billingSchedulesTable } from './billingScheduleRecord';

/** The schedule whose title is asked about: whose it is, and which schedule it is when one is being changed. */
export type TitledSchedule = { customerId: string; title: string; scheduleId: string | null };

const PostgresErrors = { uniqueViolation: '23505' } as const;

/** Why the customer cannot have another schedule of that title, or null when none of its others has it. */
export async function titleTakenRefusal(supabase: SupabaseClient, organisationId: string, schedule: TitledSchedule): Promise<string | null> {
	const { data, error } = await supabase
		.from(billingSchedulesTable)
		.select('id')
		.eq('organisation_id', organisationId)
		.eq('customer_id', schedule.customerId)
		.eq('title', schedule.title);
	if (error !== null) throw error;
	const others = (data as { id: string }[]).filter((row) => row.id !== schedule.scheduleId);
	if (others.length === 0) return null;
	return sameTitleRefusal(schedule.title);
}

/** The refusal the database's own check gives when two schedules of one customer took the same title at once. */
export function titleTakenMeanwhileRefusal(error: { code?: string }, title: string): string | null {
	if (error.code !== PostgresErrors.uniqueViolation) return null;
	return sameTitleRefusal(title);
}

function sameTitleRefusal(title: string): string {
	return `The customer already has a schedule titled "${title}"; each of its schedules has its own title, and list_billing_schedules lists them.`;
}
