import { chatReadingLimits, type ChatReadingSince } from '$lib/data/chat/chatReadingRules';
import { describeChatFlowEntry } from './describeChatFlowEntry';
import { coversUpToLine, describeLatestSummary } from './describeChatSummary';
import type { ChatFileLinks } from './describeChatMessageFiles';
import type { ChatRoomReading } from '$lib/server/chat/readChatRoomAsAsked';

const archivedLine = 'This room is archived: it is read, never written in.';
const marksNothingRead = 'Reading marks nothing read: your place in the room and your notification for it stay as they were.';
const noneLeftOut = 0;

const openings: Record<ChatReadingSince, string> = {
	unread: 'New to you since you last read it, oldest first:',
	all: 'Its latest messages, oldest first:'
};

const emptyReadings: Record<ChatReadingSince, string> = {
	unread: 'Nothing is new to you here since you last read it.',
	all: 'Nothing has been said here yet.'
};

function headingOf(organisationName: string, reading: ChatRoomReading): string {
	const { room } = reading;
	const purpose = room.purpose === '' ? '' : ` — ${room.purpose}`;
	return `${room.name}, in ${organisationName}'s chat, room ${room.id}${purpose}`;
}

function leftOutLine(messagesLeftOut: number): string | null {
	if (messagesLeftOut === noneLeftOut) return null;
	return `${messagesLeftOut} earlier ones are left out; read the room again with a larger limit, up to ${chatReadingLimits.mostMessagesRead}.`;
}

function linesOf(reading: ChatRoomReading, links: ChatFileLinks): string[] {
	const { entries, since } = reading;
	if (entries.length === 0) return [emptyReadings[since]];
	return [openings[since], ...entries.map((entry) => describeChatFlowEntry(entry, links))];
}

/**
 * The lines of one room's reading, under its heading: archived or not, its latest catch-up, then its lines, what was
 * left out, and the moment a catch-up of them covers up to.
 */
export function describeRoomLines(organisationName: string, reading: ChatRoomReading, links: ChatFileLinks): string[] {
	const { room, messagesLeftOut, latestSummary } = reading;
	const archived = room.isArchived ? archivedLine : null;
	const heading = headingOf(organisationName, reading);
	const catchUp = describeLatestSummary(latestSummary);
	const lines = [heading, archived, catchUp, ...linesOf(reading, links), leftOutLine(messagesLeftOut), coversUpToLine(reading)];
	return lines.filter((line) => line !== null);
}

/** One room as read_chat_room gives it, ending with the reminder that reading marks nothing read. */
export function describeChatRoomReading(organisationName: string, reading: ChatRoomReading, links: ChatFileLinks): string {
	return [...describeRoomLines(organisationName, reading, links), marksNothingRead].join('\n');
}

/** Everything new to the reader across the organisation's chat, room by room, or one plain line when nothing is. */
export function describeChatUnread(organisationName: string, readings: ChatRoomReading[], links: ChatFileLinks): string {
	if (readings.length === 0) return `Nothing is unread in ${organisationName}'s chat.`;
	const opening = `New to you in ${organisationName}'s chat, room by room. Reading marks nothing read.`;
	const rooms = readings.map((reading) => describeRoomLines(organisationName, reading, links).join('\n'));
	return [opening, ...rooms].join('\n\n');
}
