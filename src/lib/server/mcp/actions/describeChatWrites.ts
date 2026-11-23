import type { ChatMessage } from '$lib/data/chat/chatMessageRules';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { ChatMoveMade } from '$lib/server/chat/moveChatMessages';

/** What was said, where and as whom, once it is in the room. */
export function describePostedMessage(organisationName: string, message: ChatMessage): string {
	return (
		`Said in room ${message.roomId} of ${organisationName}'s chat, as the person you act for through their Claude: ` +
		`message ${message.id}, at ${message.createdAt}. Your place in the room is now, as when they post on the site.`
	);
}

function describeKeptRoom(organisationName: string, room: ChatRoom, outcome: string): string {
	const purpose = room.purpose === '' ? '' : ` It is for: ${room.purpose}`;
	return `${room.name} ${outcome} in ${organisationName}'s chat, room ${room.id}.${purpose}`;
}

/** The room as it stands once it is opened. */
export function describeOpenedRoom(organisationName: string, room: ChatRoom): string {
	return describeKeptRoom(organisationName, room, 'is open');
}

/** The room as it stands once it is changed or archived. */
export function describeUpdatedRoom(organisationName: string, room: ChatRoom): string {
	if (room.isArchived) return describeKeptRoom(organisationName, room, 'is archived');
	return describeKeptRoom(organisationName, room, 'is saved');
}

/** How many messages went where; the room they left keeps the line saying so. */
export function describeMadeMove({ move, destination }: ChatMoveMade): string {
	return (
		`Moved ${move.messageCount} to ${destination.name}, room ${destination.id}. The room they left keeps a line ` +
		'saying where they went and who moved them.'
	);
}

/** The room the reader's place has moved to now in. */
export function describeRoomMarkedRead(room: ChatRoom): string {
	return `${room.name} is marked read for you: your place in it is now, and your notification for it is read.`;
}
