import { openQuestion, type TurnMessage } from '$lib/data/currentTurn';
import { parseHandOff, parsePostedVia } from '$lib/data/conversationTurn';
import type { SupabaseClient } from '@supabase/supabase-js';

const turnColumns = 'task_id, author_account_id, posted_via, awaiting_account_id, awaiting_kind, created_at';

type TaskMessage = TurnMessage & { taskId: string };

/**
 * The tasks whose thread holds a question still open for someone other than this person, so the
 * baton is with them: the work waits on that answer and is not the person's to raise now.
 */
export async function getTasksWaitingOnOthers(
	supabase: SupabaseClient,
	taskIds: string[],
	personAccountIds: string[]
): Promise<Set<string>> {
	if (taskIds.length === 0) return new Set();
	const messages = await getTaskMessages(supabase, taskIds);
	const waiting = taskIds.filter((taskId) => {
		const thread = messages.filter((message) => message.taskId === taskId);
		const awaiting = openQuestion(thread)?.awaiting ?? null;
		return awaiting !== null && !personAccountIds.includes(awaiting.accountId);
	});
	return new Set(waiting);
}

async function getTaskMessages(supabase: SupabaseClient, taskIds: string[]): Promise<TaskMessage[]> {
	const { data, error } = await supabase
		.from('conversation_messages')
		.select(turnColumns)
		.in('task_id', taskIds)
		.eq('is_internal', false)
		.order('created_at', { ascending: true });
	if (error) throw error;
	return ((data ?? []) as Record<string, unknown>[]).map(readTaskMessage);
}

function readTaskMessage(row: Record<string, unknown>): TaskMessage {
	return {
		taskId: row.task_id as string,
		authorAccountId: row.author_account_id as string,
		postedVia: parsePostedVia(row.posted_via),
		awaiting: parseHandOff(row.awaiting_account_id, row.awaiting_kind),
		pickedUpAt: null,
		createdAt: row.created_at as string
	};
}
