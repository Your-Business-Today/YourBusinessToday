import type { SupabaseClient } from '@supabase/supabase-js';
import { BooksRefusal } from '$lib/server/books/booksRefusal';
import { findBillingSchedule, findBillingSchedules, type BillingScheduleFilter } from '$lib/server/books/billingSchedules';
import { findInvoiceNamings } from '$lib/server/books/invoiceNamings';
import { findScheduledInvoices } from '$lib/server/books/scheduledInvoices';
import { findBillingRunStarts } from '$lib/server/books/billingRunStarts';
import { describeBillingRunStart } from '$lib/data/books/billingRunStartSentence';
import { describeBillingSchedule, describeBillingSchedules } from './describeBillingSchedules';

/** The organisation whose books are read. */
type BooksOrganisation = { id: string; name: string };

/** One schedule in full as the person knows it, or a refusal when the organisation's books hold none with that id. */
export async function readBillingSchedule(supabase: SupabaseClient, organisationId: string, scheduleId: string): Promise<string> {
	const [schedule, namings, scheduledInvoices] = await Promise.all([
		findBillingSchedule(supabase, organisationId, scheduleId),
		findInvoiceNamings(supabase, organisationId),
		findScheduledInvoices(supabase, organisationId)
	]);
	if (schedule === null) throw new BooksRefusal(`No billing schedule ${scheduleId} is in this organisation's books; list_billing_schedules lists them.`);
	return describeBillingSchedule(schedule, { namings, scheduledInvoices });
}

/** Every schedule that matches, each in full, as the person knows them, then when today's billing run started. */
export async function readBillingSchedules(supabase: SupabaseClient, organisation: BooksOrganisation, filter: BillingScheduleFilter): Promise<string> {
	const [schedules, namings, scheduledInvoices, runStarts] = await Promise.all([
		findBillingSchedules(supabase, organisation.id, filter),
		findInvoiceNamings(supabase, organisation.id),
		findScheduledInvoices(supabase, organisation.id),
		findBillingRunStarts(supabase, new Date())
	]);
	const described = describeBillingSchedules(organisation.name, schedules, { namings, scheduledInvoices });
	return `${described}\n\n${describeBillingRunStart(runStarts)}`;
}
