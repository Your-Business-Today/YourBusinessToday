import { chatFlowKinds, type ChatFlowEntry } from './chatRoomFlow';

/**
 * The part of a room a reading takes: the messages new to the reader (null for every message the room shows), the
 * moment the reader had read up to (null for a room never opened, or for a reading of everything), and how many
 * messages it gives at most.
 */
export type ChatReadingWindow = { unreadMessageIds: Set<string> | null; readUpTo: string | null; limit: number };

/** The lines a reading gives, oldest first, and how many earlier messages in its span it left out for its limit. */
export type ChatFlowRead<Message> = { entries: ChatFlowEntry<Message>[]; messagesLeftOut: number };

type Said = { id: string };

const noneLeftOut = 0;

function isAfterPlace(moment: string, readUpTo: string | null): boolean {
	if (readUpTo === null) return true;
	return Date.parse(moment) > Date.parse(readUpTo);
}

function isMessageInWindow(message: Said, window: ChatReadingWindow): boolean {
	const { unreadMessageIds } = window;
	if (unreadMessageIds === null) return true;
	return unreadMessageIds.has(message.id);
}

function isInWindow<Message extends Said>(entry: ChatFlowEntry<Message>, window: ChatReadingWindow): boolean {
	if (entry.kind === chatFlowKinds.message) return isMessageInWindow(entry.message, window);
	return isAfterPlace(entry.moment, window.readUpTo);
}

function latestWithinLimit<Message>(entries: ChatFlowEntry<Message>[], limit: number): ChatFlowRead<Message> {
	const messageEntries = entries.filter((entry) => entry.kind === chatFlowKinds.message);
	const messagesLeftOut = Math.max(messageEntries.length - limit, noneLeftOut);
	if (messagesLeftOut === noneLeftOut) return { entries, messagesLeftOut };
	const oldestKept = messageEntries[messagesLeftOut];
	return { entries: entries.slice(entries.indexOf(oldestKept)), messagesLeftOut };
}

/**
 * The room's flow as one reading gives it: the messages in its window, each move out of the room made after the
 * reader's place, as the room's marker line tells of it, and only the latest messages up to the limit, with the moves
 * among them.
 */
export function chatFlowWithin<Message extends Said>(flow: ChatFlowEntry<Message>[], window: ChatReadingWindow): ChatFlowRead<Message> {
	const inWindow = flow.filter((entry) => isInWindow(entry, window));
	return latestWithinLimit(inWindow, window.limit);
}
