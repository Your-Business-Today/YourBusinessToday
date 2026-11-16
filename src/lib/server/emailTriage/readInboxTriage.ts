import type { SupabaseClient } from '@supabase/supabase-js';
import { triageDecisionLimits, triageOutcomes, type TriageOutcome } from '$lib/data/triageDecisionRules';

const { daysRemembered, mostIdsShown } = triageDecisionLimits;
const dayInMilliseconds = 24 * 60 * 60 * 1000;

/** Where triage of one mailbox stands: the latest decision, the emails decided lately and how each was settled. */
export type InboxTriage = {
	mailbox: string;
	lastDecidedAt: string | null;
	recentMessageIds: string[];
	recentCount: number;
	countsByOutcome: Record<TriageOutcome, number>;
};

/** Reads what has been decided in the mailbox over the days remembered, newest first. */
export async function readInboxTriage(supabase: SupabaseClient, mailbox: string, now: Date): Promise<InboxTriage> {
	const since = new Date(now.getTime() - daysRemembered * dayInMilliseconds).toISOString();
	const lastDecidedAt = await readLastDecidedAt(supabase, mailbox);
	const recentMessageIds = await readRecentMessageIds(supabase, mailbox, since);
	const counts = await Promise.all(triageOutcomes.map((outcome) => countOutcome(supabase, mailbox, since, outcome)));
	const countsByOutcome = Object.fromEntries(triageOutcomes.map((outcome, index) => [outcome, counts[index]]));
	const recentCount = counts.reduce((total, count) => total + count, 0);
	return { mailbox, lastDecidedAt, recentMessageIds, recentCount, countsByOutcome: countsByOutcome as Record<TriageOutcome, number> };
}

function decisionsIn(supabase: SupabaseClient, mailbox: string) {
	return supabase.from('email_triage_decisions').select('gmail_message_id, decided_at').eq('mailbox', mailbox);
}

async function readLastDecidedAt(supabase: SupabaseClient, mailbox: string): Promise<string | null> {
	const { data, error } = await decisionsIn(supabase, mailbox).order('decided_at', { ascending: false }).limit(1);
	if (error) throw error;
	const [latest] = data as { decided_at: string }[];
	return latest?.decided_at ?? null;
}

async function readRecentMessageIds(supabase: SupabaseClient, mailbox: string, since: string): Promise<string[]> {
	const { data, error } = await decisionsIn(supabase, mailbox)
		.gte('decided_at', since)
		.order('decided_at', { ascending: false })
		.limit(mostIdsShown);
	if (error) throw error;
	return (data as { gmail_message_id: string }[]).map((row) => row.gmail_message_id);
}

async function countOutcome(supabase: SupabaseClient, mailbox: string, since: string, outcome: TriageOutcome): Promise<number> {
	const { count, error } = await supabase
		.from('email_triage_decisions')
		.select('id', { count: 'exact', head: true })
		.eq('mailbox', mailbox)
		.eq('outcome', outcome)
		.gte('decided_at', since);
	if (error) throw error;
	return count ?? 0;
}
