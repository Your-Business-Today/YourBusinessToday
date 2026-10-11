import type { SupabaseClient } from '@supabase/supabase-js';
import { parseWaitingQuestion, waitingQuestionColumns, type WaitingQuestion } from './waitingQuestion';

/**
 * Every open question waiting on this account, on goals and tasks alike and done tasks
 * included, the longest waiting first. It only reads: nothing is marked picked up and the
 * inbox marker stays where it is, so asking twice gives the same list.
 */
export async function getQuestionsWaitingOn(
	supabase: SupabaseClient,
	accountId: string
): Promise<WaitingQuestion[]> {
	const messageIds = await getWaitingMessageIds(supabase, accountId);
	if (messageIds.length === 0) return [];
	const { data, error } = await supabase
		.from('conversation_messages')
		.select(waitingQuestionColumns)
		.in('id', messageIds)
		.order('created_at', { ascending: true });
	if (error) throw error;
	const rows = data as unknown as Record<string, unknown>[];
	return rows.flatMap((row) => parseWaitingQuestion(row) ?? []);
}

async function getWaitingMessageIds(supabase: SupabaseClient, accountId: string): Promise<string[]> {
	const { data, error } = await supabase
		.from('conversation_turns')
		.select('message_id')
		.eq('awaiting_account_id', accountId);
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => row.message_id as string);
}
