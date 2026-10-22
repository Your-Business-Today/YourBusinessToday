import type { SupabaseClient } from '@supabase/supabase-js';
import { idBatches } from '$lib/server/schema/idBatches';
import { messageColumns, parseMessageRecord, type ConversationMessage } from './messageRecord';

/** The latest message on each of these tasks; a task nobody has spoken on has none. */
export async function getLatestMessageOnTasks(
	supabase: SupabaseClient,
	taskIds: string[],
	shouldIncludeInternal: boolean
): Promise<Map<string, ConversationMessage>> {
	const batches = await Promise.all(
		idBatches(taskIds).map((batch) => readMessages(supabase, batch, shouldIncludeInternal))
	);
	const latestByTask = new Map<string, ConversationMessage>();
	for (const message of batches.flat()) {
		const taskId = message.taskId ?? '';
		const known = latestByTask.get(taskId);
		if (known === undefined || known.createdAt < message.createdAt) latestByTask.set(taskId, message);
	}
	return latestByTask;
}

async function readMessages(
	supabase: SupabaseClient,
	taskIds: string[],
	shouldIncludeInternal: boolean
): Promise<ConversationMessage[]> {
	let query = supabase.from('conversation_messages').select(messageColumns).in('task_id', taskIds);
	if (!shouldIncludeInternal) query = query.eq('is_internal', false);
	const { data, error } = await query.order('created_at', { ascending: false });
	if (error) throw error;
	return data.map(parseMessageRecord);
}
