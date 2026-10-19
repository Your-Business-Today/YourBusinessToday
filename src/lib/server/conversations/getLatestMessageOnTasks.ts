import type { SupabaseClient } from '@supabase/supabase-js';
import { messageColumns, parseMessageRecord, type ConversationMessage } from './messageRecord';

/** The latest message on each of these tasks; a task nobody has spoken on has none. */
export async function getLatestMessageOnTasks(
	supabase: SupabaseClient,
	taskIds: string[],
	shouldIncludeInternal: boolean
): Promise<Map<string, ConversationMessage>> {
	if (taskIds.length === 0) return new Map();
	let query = supabase.from('conversation_messages').select(messageColumns).in('task_id', taskIds);
	if (!shouldIncludeInternal) query = query.eq('is_internal', false);
	const { data, error } = await query.order('created_at', { ascending: false });
	if (error) throw error;
	const latestByTask = new Map<string, ConversationMessage>();
	for (const message of data.map(parseMessageRecord)) {
		const taskId = message.taskId ?? '';
		if (!latestByTask.has(taskId)) latestByTask.set(taskId, message);
	}
	return latestByTask;
}
