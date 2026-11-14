import type { SupabaseClient } from '@supabase/supabase-js';
import type { BillingRunEvent } from '$lib/data/books/billingRunReport';
import { validateRecordId } from '$lib/data/isUuid';
import { refuseWhen } from './booksRefusal';
import { readBooksForRun } from './billingRunBooks';
import { finishCutOffInvoices } from './billingRunCatchUp';
import type { BillingRunRequest } from './billingRunDelivery';
import { raiseDueInvoices } from './billingRunRaising';

/**
 * Runs one organisation's billing schedules for the day: first finishes what an earlier run left half done, then raises
 * one invoice from each schedule whose day has come, issuing and sending it when the schedule sends by itself. A schedule
 * several periods behind catches up one period a run. Answers everything it did and everything it left, in order.
 */
export async function runBillingSchedules(supabase: SupabaseClient, request: BillingRunRequest): Promise<BillingRunEvent[]> {
	refuseWhen(validateRecordId('organisation', request.organisationId));
	const books = await readBooksForRun(supabase, request.organisationId);
	const finished = await finishCutOffInvoices(supabase, request, books);
	const raised = await raiseDueInvoices(supabase, request, books);
	return [...finished, ...raised];
}
