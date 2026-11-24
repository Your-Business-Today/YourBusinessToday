import type { PostedVia } from '$lib/data/conversationTurn';

/** The limits on a catch-up of a room, stated once and mirrored by the checks on migration 0276's columns. */
export const chatSummaryLimits = {
	longestWords: 4000
} as const;

/** A catch-up of a room written by a person's own Claude: what it says, and the last moment of the room it covers. */
export type ChatSummary = {
	id: string;
	roomId: string;
	coversUpTo: string;
	words: string;
	writtenByAccountId: string;
	writtenVia: PostedVia;
	createdAt: string;
};

/** A catch-up with who wrote it, as the room and the connector tell of it. */
export type NamedChatSummary = ChatSummary & { writerName: string };

/** What a catch-up is to say and the moment it covers up to, as checked by validateChatSummary. */
export type ChatSummaryGiven = { words: string; coversUpTo: string };

const { longestWords } = chatSummaryLimits;

/** A date and time with its offset, to the second at least, as the connector's readings give a message's moment. */
export const momentWithOffset = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/;

export const chatSummaryRefusals = {
	words: `A catch-up's words are 1 to ${longestWords} characters.`,
	coversUpTo: 'Give the moment of the last message the catch-up covers as a date and time with its offset, such as 2026-11-22T09:30:00Z.',
	coversTheFuture: 'The moment a catch-up covers up to is never in the future.',
	coversPastTheLatest: "The moment a catch-up covers up to is never later than the room's latest message.",
	nothingSaid: 'Nothing has been said in this room yet, so there is nothing to catch up on.'
} as const;
