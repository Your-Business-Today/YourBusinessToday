import { messageLine } from './describeMessages';
import {
	informationHeading,
	nothingNew,
	splitInbox,
	waitingCountSentence,
	waitingHeading
} from './inboxSections';
import { subjectKeyOf, subjectTitles } from './subjectTitles';
import { withAuthorNames, type NamedMessage } from '$lib/server/conversations/withAuthorNames';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { Inbox } from '$lib/server/conversations/readInbox';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The inbox in words: what waits on the reader first, then everything else, grouped by goal and task. */
export async function describeInbox(
	supabase: SupabaseClient,
	inbox: Inbox,
	accounts: Account[],
	viewerId: string
): Promise<string> {
	const messages = inbox.messages;
	if (messages.length === 0) return nothingNew;
	const titles = await subjectTitles(supabase, messages);
	const sections = splitInbox(withAuthorNames(messages, accounts), viewerId);
	return [
		waitingCountSentence(sections),
		'',
		...section(waitingHeading, sections.waitingOnReader, titles, viewerId),
		...section(informationHeading, sections.forInformation, titles, viewerId)
	].join('\n');
}

function section(
	heading: string,
	messages: NamedMessage[],
	titles: Map<string, string>,
	viewerId: string
): string[] {
	if (messages.length === 0) return [];
	return [heading, '', ...subjectBlocks(messages, titles, viewerId)];
}

function subjectBlocks(
	messages: NamedMessage[],
	titles: Map<string, string>,
	viewerId: string
): string[] {
	return [...groupBySubject(messages).entries()].flatMap(([subjectKey, grouped]) => [
		subjectHeading(subjectKey, titles),
		...grouped.map((message) => messageLine(message, viewerId)),
		''
	]);
}

function groupBySubject(messages: NamedMessage[]): Map<string, NamedMessage[]> {
	const groups = new Map<string, NamedMessage[]>();
	for (const message of messages) {
		const key = subjectKeyOf(message);
		groups.set(key, [...(groups.get(key) ?? []), message]);
	}
	return groups;
}

function subjectHeading(subjectKey: string, titles: Map<string, string>): string {
	const [kind, id] = subjectKey.split(':');
	return `On the ${kind} "${titles.get(subjectKey) ?? 'unknown'}" (${kind} id: ${id}):`;
}
