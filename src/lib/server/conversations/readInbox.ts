import type { SupabaseClient } from '@supabase/supabase-js';
import { advanceInboxCursor, getInboxCursorForAccount } from './inboxCursor';
import { messageColumns, parseMessageRecord, type ConversationMessage } from './messageRecord';

export type InboxScope = {
	accountId: string;
	projectIds: string[] | null;
	shouldIncludeInternal: boolean;
};

export type Inbox = { since: string; messages: ConversationMessage[] };

const mostMessages = 100;

export async function readInbox(supabase: SupabaseClient, scope: InboxScope): Promise<Inbox> {
	const since = await getInboxCursorForAccount(supabase, scope.accountId);
	const readAt = new Date().toISOString();
	const messages = await getMessagesSince(supabase, scope, since);
	await advanceInboxCursor(supabase, scope.accountId, readUpTo(messages, readAt));
	return { since, messages };
}

/** A read that filled the page leaves the cursor on its last message, so nothing beyond it is skipped. */
function readUpTo(messages: ConversationMessage[], readAt: string): string {
	const lastMessage = messages.at(-1);
	if (messages.length < mostMessages || lastMessage === undefined) return readAt;
	return lastMessage.createdAt;
}

async function getMessagesSince(
	supabase: SupabaseClient,
	scope: InboxScope,
	since: string
): Promise<ConversationMessage[]> {
	if (scope.projectIds === null) return everyMessageSince(supabase, scope, since);
	const [onGoals, onTasks] = await Promise.all([
		messagesOnProjectsSince(supabase, scope, since, 'goals', scope.projectIds),
		messagesOnProjectsSince(supabase, scope, since, 'tasks', scope.projectIds)
	]);
	return [...onGoals, ...onTasks]
		.sort((left, right) => left.createdAt.localeCompare(right.createdAt))
		.slice(0, mostMessages);
}

async function everyMessageSince(
	supabase: SupabaseClient,
	scope: InboxScope,
	since: string
): Promise<ConversationMessage[]> {
	const { data, error } = await supabase
		.from('conversation_messages')
		.select(messageColumns)
		.gt('created_at', since)
		.neq('author_account_id', scope.accountId)
		.in('is_internal', audiencesFor(scope))
		.order('created_at', { ascending: true })
		.limit(mostMessages);
	if (error) throw error;
	return data.map(parseMessageRecord);
}

async function messagesOnProjectsSince(
	supabase: SupabaseClient,
	scope: InboxScope,
	since: string,
	subjectTable: 'goals' | 'tasks',
	projectIds: string[]
): Promise<ConversationMessage[]> {
	const { data, error } = await supabase
		.from('conversation_messages')
		.select(`${messageColumns}, ${subjectTable}!inner(project_id)`)
		.in(`${subjectTable}.project_id`, projectIds)
		.gt('created_at', since)
		.neq('author_account_id', scope.accountId)
		.in('is_internal', audiencesFor(scope))
		.order('created_at', { ascending: true })
		.limit(mostMessages);
	if (error) throw error;
	return data.map(parseMessageRecord);
}

function audiencesFor(scope: InboxScope): boolean[] {
	if (scope.shouldIncludeInternal) return [true, false];
	return [false];
}
