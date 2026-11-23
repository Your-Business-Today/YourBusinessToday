import { formatUkDayAndTime } from '$lib/data/britishDate';
import { writerOfSummary } from '$lib/data/chat/chatCatchUpWords';
import { messagesIn } from '$lib/data/chat/chatRoomFlow';
import type { ChatSummary, NamedChatSummary } from '$lib/data/chat/chatSummaryRules';
import type { ChatRoomReading } from '$lib/server/chat/readChatRoomAsAsked';

const wordsIndent = '  ';
const noCatchUpYet = 'No catch-up has been written of this room yet.';

function indentedWords(words: string): string {
	return words
		.split('\n')
		.map((line) => `${wordsIndent}${line}`)
		.join('\n');
}

/** The catch-up as it is saved: which room, the moment it covers up to, and that it is for everyone in the room. */
export function describeRecordedSummary(organisationName: string, summary: ChatSummary): string {
	return (
		`Catch-up ${summary.id} saved for room ${summary.roomId} of ${organisationName}'s chat, covering up to ` +
		`${formatUkDayAndTime(summary.coversUpTo)}. Everyone coming back to the room with unread messages sees it above ` +
		'the room. Nothing was marked read and no one was told.'
	);
}

/** The room's latest catch-up as a reading tells of it: who wrote it, what it covers up to, then its words. */
export function describeLatestSummary(summary: NamedChatSummary | null): string {
	if (summary === null) return noCatchUpYet;
	const heading =
		`Latest catch-up, written by ${writerOfSummary(summary)} on ${formatUkDayAndTime(summary.createdAt)}, ` +
		`covering up to ${formatUkDayAndTime(summary.coversUpTo)} (${summary.coversUpTo}):`;
	return [heading, indentedWords(summary.words)].join('\n');
}

/** The moment of the last message the reading gives, to save a catch-up of it with record_chat_summary, or null. */
export function coversUpToLine(reading: ChatRoomReading): string | null {
	const lastMessage = messagesIn(reading.entries).at(-1);
	if (lastMessage === undefined) return null;
	return `To save a catch-up of these messages with record_chat_summary, give coversUpTo ${lastMessage.createdAt}.`;
}
