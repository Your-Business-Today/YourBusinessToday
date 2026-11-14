import type { SupabaseClient } from '@supabase/supabase-js';
import { describeBillingRun, movesMadeIn } from '$lib/data/books/billingRunReport';
import { billingRunOpensAt } from '$lib/data/books/scheduledInvoice';
import { ukClockAt, type UkClock } from '$lib/data/ukClock';
import { runBillingSchedules } from '$lib/server/books/billingRun';
import { messageOf } from '$lib/server/books/booksStep';
import { findOrganisationsKeepingBooks, type BooksOrganisation } from '$lib/server/books/billingRunOrganisations';
import type { WatchOutcome } from './watchRunLog';
import type { WatchSource } from './watchSource';

export const billingSchedulesSourceName = 'billing_schedules';

/** Knocked every hour: raises, issues and sends each billing schedule's invoice on its day, in every organisation's books. */
export const billingSchedulesSource: WatchSource = {
	name: billingSchedulesSourceName,
	summary: "raises each billing schedule's invoice on its day, from 07:00 UK time, and issues and sends it when the schedule sends by itself",
	run: runSchedules
};

type OrganisationRun = { note: string; movesMade: number };

async function runSchedules(supabase: SupabaseClient): Promise<WatchOutcome> {
	const clock = ukClockAt(new Date());
	if (clock.time < billingRunOpensAt) return outcomeOf(0, `It is before ${billingRunOpensAt} on a UK clock, so nothing is raised yet.`);
	const organisations = await findOrganisationsKeepingBooks(supabase);
	const runs: OrganisationRun[] = [];
	for (const organisation of organisations) runs.push(await runOrganisation(supabase, organisation, clock));
	const note = runs.map((run) => run.note).join(' ');
	return outcomeOf(runs.reduce((total, run) => total + run.movesMade, 0), note || 'No organisation has Accounts switched on.');
}

/** One organisation's run; a failure that stops it is named, and the next organisation still runs. */
async function runOrganisation(supabase: SupabaseClient, organisation: BooksOrganisation, clock: UkClock): Promise<OrganisationRun> {
	try {
		const events = await runBillingSchedules(supabase, { organisationId: organisation.id, today: clock.date, sentByAccountId: null });
		return { note: `${organisation.name}: ${describeBillingRun(events)}`, movesMade: movesMadeIn(events) };
	} catch (failure) {
		return { note: `${organisation.name}: the run stopped, ${messageOf(failure)}.`, movesMade: 0 };
	}
}

function outcomeOf(rowsWritten: number, note: string): WatchOutcome {
	return { rowsWritten, resumeMarker: new Date().toISOString(), note, isFinished: true };
}
