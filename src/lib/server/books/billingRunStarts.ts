import type { SupabaseClient } from '@supabase/supabase-js';
import { billingRunOpensAt } from '$lib/data/books/scheduledInvoice';
import type { BillingRunStarts } from '$lib/data/books/billingRunStartSentence';
import { momentOnUkClock, ukClockAt } from '$lib/data/ukClock';
import { billingSchedulesSourceName } from '$lib/server/watch/billingSchedulesSource';

const startedAtColumn = 'started_at';

type StartAnswer = { data: unknown; error: unknown };

/** When today's billing run started, the first run from 07:00 UK time today, and when any run last started: times only, never a note. */
export async function findBillingRunStarts(supabase: SupabaseClient, now: Date): Promise<BillingRunStarts> {
	const opensAt = momentOnUkClock({ date: ukClockAt(now).date, time: billingRunOpensAt });
	const [todayStartedAt, lastStartedAt] = await Promise.all([findFirstStartSince(supabase, opensAt), findLastStart(supabase)]);
	return { todayStartedAt, lastStartedAt };
}

function startsOfTheRun(supabase: SupabaseClient) {
	return supabase.from('watch_runs').select(startedAtColumn).eq('source', billingSchedulesSourceName);
}

async function findFirstStartSince(supabase: SupabaseClient, opensAt: Date | null): Promise<string | null> {
	if (opensAt === null) return null;
	const since = startsOfTheRun(supabase).gte(startedAtColumn, opensAt.toISOString());
	return startedAtOf(await since.order(startedAtColumn, { ascending: true }).limit(1).maybeSingle());
}

async function findLastStart(supabase: SupabaseClient): Promise<string | null> {
	return startedAtOf(await startsOfTheRun(supabase).order(startedAtColumn, { ascending: false }).limit(1).maybeSingle());
}

function startedAtOf(answer: StartAnswer): string | null {
	if (answer.error !== null) throw answer.error;
	const row = answer.data as { started_at: string } | null;
	return row?.started_at ?? null;
}
