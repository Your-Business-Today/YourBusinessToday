import { chatFlowKinds, movedAwaySentence, movedHereNote, type MovedAwayMarker } from '$lib/data/chat/chatRoomFlow';
import { postedViaChannels } from '$lib/data/conversationTurn';
import { formatUkDayAndTime } from '$lib/data/britishDate';
import type { ChatRoomFlowEntry, ChatRoomMessage } from '$lib/server/chat/readChatFlowOfRoom';

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

function indentedBody(body: string): string {
	return body
		.split('\n')
		.map((line) => `${bodyIndent}${line}`)
		.join('\n');
}

/** One message: when, who said it (themselves or through their Claude), its id, where it was moved from, then its words. */
export function describeChatMessage(message: ChatRoomMessage): string {
	const heading = `- ${formatUkDayAndTime(message.createdAt)} — ${speakerOf(message)}, message ${message.id}${movedHereClause(message)}:`;
	return `${heading}\n${indentedBody(message.body)}`;
}

/** The line a move out of the room left, at its moment, as the room on the site shows it. */
export function describeMovedAway(marker: MovedAwayMarker): string {
	return `- ${formatUkDayAndTime(marker.movedAt)} — ${movedAwaySentence(marker)}; they are read in ${marker.toRoomName} now, room ${marker.toRoomId}.`;
}

/** One line of a room's flow: something said, or the mark of messages moved away. */
export function describeChatFlowEntry(entry: ChatRoomFlowEntry): string {
	if (entry.kind === chatFlowKinds.message) return describeChatMessage(entry.message);
	return describeMovedAway(entry.marker);
}
