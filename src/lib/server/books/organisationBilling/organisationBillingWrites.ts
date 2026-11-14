import type { SupabaseClient } from '@supabase/supabase-js';
import { billingSettingNames } from '$lib/data/books/billingScheduleSettingRules';
import type { Organisation } from '$lib/server/organisations/organisationRecord';
import { changeBillingSchedule } from '../changeBillingSchedule';
import { createBillingSchedule } from '../createBillingSchedule';
import type { BillingSchedule } from '../billingScheduleRecord';
import { requireBilledCustomer, requireOwnBooksFor, requireScheduleOfOrganisation } from './billedOrganisationGates';

/**
 * Sets up a schedule in Your Business Today's own books for the organisation, making the customer that stands for it
 * from its Details when none does yet, and answers the schedule's id. The same step create_billing_schedule takes.
 */
export async function setUpOrganisationBilling(service: SupabaseClient, organisation: Organisation, fields: Record<string, unknown>): Promise<string> {
	const books = await requireOwnBooksFor(service, organisation);
	const customer = await requireBilledCustomer(service, books, organisation);
	return createBillingSchedule(service, books.id, { ...fields, customerId: customer.id });
}

/**
 * Changes one of the organisation's schedules to the settings and lines the form holds, as update_billing_schedule
 * does. A setting the form left as the schedule holds it is not sent, so a schedule that fell behind keeps its date.
 */
export async function changeOrganisationBilling(service: SupabaseClient, organisation: Organisation, fields: Record<string, unknown>): Promise<void> {
	const books = await requireOwnBooksFor(service, organisation);
	const schedule = await requireScheduleOfOrganisation(service, books, organisation, fields.scheduleId);
	await changeBillingSchedule(service, books.id, { scheduleId: schedule.id, ...changedSettings(schedule, fields), lines: fields.lines });
}

/** Pauses or resumes one of the organisation's schedules at once. */
export async function pauseOrganisationBilling(service: SupabaseClient, organisation: Organisation, scheduleId: unknown, isPaused: boolean): Promise<void> {
	const books = await requireOwnBooksFor(service, organisation);
	const schedule = await requireScheduleOfOrganisation(service, books, organisation, scheduleId);
	await changeBillingSchedule(service, books.id, { scheduleId: schedule.id, isPaused });
}

function changedSettings(schedule: BillingSchedule, fields: Record<string, unknown>): Record<string, unknown> {
	const changed = billingSettingNames.filter((name) => fields[name] !== undefined && fields[name] !== schedule[name]);
	return Object.fromEntries(changed.map((name) => [name, fields[name]]));
}
