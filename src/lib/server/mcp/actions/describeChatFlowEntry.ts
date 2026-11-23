import { chatFlowKinds, movedAwaySentence, movedHereNote, type MovedAwayMarker } from '$lib/data/chat/chatRoomFlow';
import { postedViaChannels } from '$lib/data/conversationTurn';
import { formatUkDayAndTime } from '$lib/data/britishDate';
import { describeMessageFiles, type ChatFileLinks } from './describeChatMessageFiles';
import type { ChatRoomFlowEntry, ChatRoomMessage } from '$lib/server/chat/readChatFlowOfRoom';
import { indentedLines } from './indentedLines';

const bodyIndent = '  ';

function speakerOf(message: ChatRoomMessage): string {
	const isByTheirClaude = message.postedVia === postedViaChannels.claude;
	if (isByTheirClaude) return `${message.authorName}'s Claude`;
	return message.authorName;
}

function movedHereClause(message: ChatRoomMessage): string {
	const { movedHere } = message;
	if (movedHere === null) return '';
	return `, ${movedHereNote(movedHere)}`;
}

/**
 * One message: when, who said it (themselves or through their Claude), its id, where it was moved from, then its
 * words, if it has any, and the files it carries, each with a link to fetch it.
 */
export function describeChatMessage(message: ChatRoomMessage, links: ChatFileLinks): string {
	const heading = `- ${formatUkDayAndTime(message.createdAt)} — ${speakerOf(message)}, message ${message.id}${movedHereClause(message)}:`;
	const words = message.body === '' ? [] : [indentedLines(message.body, bodyIndent)];
	return [heading, ...words, ...describeMessageFiles(message.files, links)].join('\n');
}

/** The line a move out of the room left, at its moment, as the room on the site shows it. */
export function describeMovedAway(marker: MovedAwayMarker): string {
	return `- ${formatUkDayAndTime(marker.movedAt)} — ${movedAwaySentence(marker)}; they are read in ${marker.toRoomName} now, room ${marker.toRoomId}.`;
}

/** One line of a room's flow: something said, or the mark of messages moved away. */
export function describeChatFlowEntry(entry: ChatRoomFlowEntry, links: ChatFileLinks): string {
	if (entry.kind === chatFlowKinds.message) return describeChatMessage(entry.message, links);
	return describeMovedAway(entry.marker);
}
