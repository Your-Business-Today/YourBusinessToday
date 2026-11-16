import type { SupabaseClient } from '@supabase/supabase-js';
import type { TriageDecisionGiven, TriageRecording } from '$lib/data/triageDecisionRules';

const oneDecisionPerEmail = 'mailbox,gmail_message_id';
const foreignKeyViolation = '23503';

/** Keeps each decision once per email in its mailbox, an email decided before keeping its first; null when a filedEmailId names no filed email. */
export async function recordTriageDecisions(
	supabase: SupabaseClient,
	decisions: TriageDecisionGiven[],
	decidedByAccountId: string
): Promise<TriageRecording | null> {
	const rows = decisions.map((decision) => rowOf(decision, decidedByAccountId));
	const { data, error } = await supabase
		.from('email_triage_decisions')
		.upsert(rows, { onConflict: oneDecisionPerEmail, ignoreDuplicates: true })
		.select('gmail_message_id');
	if (error?.code === foreignKeyViolation) return null;
	if (error) throw error;
	const recorded = new Set((data as { gmail_message_id: string }[]).map((row) => row.gmail_message_id));
	const decidedBefore = decisions.filter((decision) => !recorded.has(decision.messageId));
	return { recordedMessageIds: [...recorded], decidedBeforeMessageIds: decidedBefore.map((decision) => decision.messageId) };
}

function rowOf(decision: TriageDecisionGiven, decidedByAccountId: string): Record<string, unknown> {
	return {
		mailbox: decision.mailbox,
		gmail_message_id: decision.messageId,
		gmail_thread_id: decision.threadId,
		outcome: decision.outcome,
		filed_email_id: decision.filedEmailId,
		note: decision.note,
		decided_by_account_id: decidedByAccountId
	};
}
