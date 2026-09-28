import { messageLine } from './describeMessages';
import { withAuthorNames, type NamedMessage } from '$lib/server/conversations/withAuthorNames';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { Inbox } from '$lib/server/conversations/readInbox';
import type { SupabaseClient } from '@supabase/supabase-js';

export async function describeInbox(
	supabase: SupabaseClient,
	inbox: Inbox,
	accounts: Account[],
	viewerId: string
): Promise<string> {
	if (inbox.messages.length === 0) return 'Nothing new since you last looked.';
	const titles = await subjectTitles(supabase, inbox);
	const grouped = groupBySubject(withAuthorNames(inbox.messages, accounts));
	return [...grouped.entries()]
		.flatMap(([subjectKey, messages]) => [
			subjectHeading(subjectKey, titles),
			...messages.map((message) => messageLine(message, viewerId)),
			''
		])
		.join('\n');
}

function groupBySubject(messages: NamedMessage[]): Map<string, NamedMessage[]> {
	const groups = new Map<string, NamedMessage[]>();
	for (const message of messages) {
		const key = subjectKeyOf(message);
		groups.set(key, [...(groups.get(key) ?? []), message]);
	}
	return groups;
}

function subjectKeyOf(message: NamedMessage): string {
	if (message.goalId !== null) return `goal:${message.goalId}`;
	return `task:${message.taskId}`;
}

function subjectHeading(subjectKey: string, titles: Map<string, string>): string {
	const [kind, id] = subjectKey.split(':');
	return `On the ${kind} "${titles.get(subjectKey) ?? 'unknown'}" (${kind} id: ${id}):`;
}

async function subjectTitles(supabase: SupabaseClient, inbox: Inbox): Promise<Map<string, string>> {
	const goalIds = inbox.messages.flatMap((message) => (message.goalId === null ? [] : [message.goalId]));
	const taskIds = inbox.messages.flatMap((message) => (message.taskId === null ? [] : [message.taskId]));
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
