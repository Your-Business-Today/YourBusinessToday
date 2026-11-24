import type { NamedChatSummary } from './chatSummaryRules';

type Said = { authorAccountId: string; createdAt: string };

/** What a reader coming back to a room is shown above it: the latest catch-up, and how many unread messages it misses. */
export type ChatCatchUp = { summary: NamedChatSummary | null; messagesAfterSummary: number };

function isSaidAfter(message: Said, moment: string): boolean {
	return Date.parse(message.createdAt) > Date.parse(moment);
}

/**
 * The messages new to the reader by the rule the unread counts go by: said after their place in the room and not by
 * them; every message not theirs in a room they have never opened.
 */
export function unreadMessagesOf<Message extends Said>(messages: Message[], readerId: string, readUpTo: string | null): Message[] {
	const others = messages.filter((message) => message.authorAccountId !== readerId);
	if (readUpTo === null) return others;
	return others.filter((message) => isSaidAfter(message, readUpTo));
}

/** The catch-up shown for the unread messages: the latest summary, if any, and how many of them came after it. */
export function catchUpOf(unread: Said[], summary: NamedChatSummary | null): ChatCatchUp {
	if (summary === null) return { summary, messagesAfterSummary: unread.length };
	const after = unread.filter((message) => isSaidAfter(message, summary.coversUpTo));
	return { summary, messagesAfterSummary: after.length };
}
