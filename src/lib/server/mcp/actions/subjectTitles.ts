import type { SupabaseClient } from '@supabase/supabase-js';
import type { ConversationMessage } from '$lib/server/conversations/messageRecord';

export function subjectKeyOf(message: ConversationMessage): string {
	if (message.goalId !== null) return `goal:${message.goalId}`;
	return `task:${message.taskId}`;
}

/** The title of every goal and task these messages sit on, by subject key. */
export async function subjectTitles(
	supabase: SupabaseClient,
	messages: ConversationMessage[]
): Promise<Map<string, string>> {
	const goalIds = messages.flatMap((message) => (message.goalId === null ? [] : [message.goalId]));
	const taskIds = messages.flatMap((message) => (message.taskId === null ? [] : [message.taskId]));
	const [goals, tasks] = await Promise.all([
		titlesFrom(supabase, 'goals', goalIds),
		titlesFrom(supabase, 'tasks', taskIds)
	]);
	return new Map([
		...goals.map(([id, title]) => [`goal:${id}`, title] as const),
		...tasks.map(([id, title]) => [`task:${id}`, title] as const)
	]);
}

async function titlesFrom(
	supabase: SupabaseClient,
	table: 'goals' | 'tasks',
	ids: string[]
): Promise<[string, string][]> {
	if (ids.length === 0) return [];
	const { data, error } = await supabase.from(table).select('id, title').in('id', [...new Set(ids)]);
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => [row.id as string, row.title as string]);
}
