import type { SupabaseClient } from '@supabase/supabase-js';
import {
	parseHandOff,
	parsePostedVia,
	type ConversationTurn
} from '$lib/data/conversationTurn';

const turnColumns =
	'task_id, author_account_id, posted_via, awaiting_account_id, awaiting_kind, picked_up_at, created_at';

/** The turn on each task's conversation, keyed by task id; a task nobody has spoken on has none. */
export async function getTaskTurns(
	supabase: SupabaseClient,
	taskIds: string[]
): Promise<Map<string, ConversationTurn>> {
	if (taskIds.length === 0) return new Map();
	const { data, error } = await supabase
		.from('conversation_turns')
		.select(turnColumns)
		.in('task_id', taskIds);
	if (error) throw error;
	return new Map(data.map((row: Record<string, unknown>) => [row.task_id as string, parseTurn(row)]));
}

function parseTurn(row: Record<string, unknown>): ConversationTurn {
	return {
		authorAccountId: row.author_account_id as string,
		postedVia: parsePostedVia(row.posted_via),
		awaiting: parseHandOff(row.awaiting_account_id, row.awaiting_kind),
		pickedUpAt: (row.picked_up_at as string) ?? null,
		since: row.created_at as string
	};
}
