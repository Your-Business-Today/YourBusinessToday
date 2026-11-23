import { chatHomePath } from '$lib/data/chat/chatPaths';
import type { ChatRoomWithUnread } from '$lib/data/chat/chatUnreadCounts';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const nothingNew = 0;
const subroomIndent = '  ';
const nextReadings = 'Read one room with read_chat_room, or everything new to you with read_chat_unread. Reading marks nothing read.';

/** How much is new in a room, as a short sentence: "3 unread." or "Nothing unread." */
export function unreadSentence(unreadCount: number): string {
	if (unreadCount === nothingNew) return 'Nothing unread.';
	return `${unreadCount} unread.`;
}

/** One room as a line of the list: its name and id, what it is for, and how much is new; a subroom sits indented. */
export function describeListedRoom(room: ChatRoomWithUnread): string {
	const indent = room.isSubroom ? subroomIndent : '';
	const purpose = room.purpose === '' ? '' : ` ${room.purpose}`;
	return `${indent}- ${room.name}, room ${room.id}:${purpose} ${unreadSentence(room.unreadCount)}`;
}

/** Why the list is empty: the rooms are opened by the first visit on the site, never by reading them. */
export function noRoomsYet(organisation: Pick<Organisation, 'id' | 'name'>): string {
	return (
		`${organisation.name} has no chat rooms yet. They open the first time someone visits its chat on the site, at ` +
		`${chatHomePath(organisation.id)}; reading them here opens none.`
	);
}

/** The organisation's rooms not archived, General first and each subroom beneath its room, with what is new in each. */
export function describeChatRooms(organisation: Pick<Organisation, 'id' | 'name'>, rooms: ChatRoomWithUnread[]): string {
	if (rooms.length === 0) return noRoomsYet(organisation);
	const opening = `${organisation.name}'s chat rooms, General first, each subroom beneath its room:`;
	return [opening, ...rooms.map(describeListedRoom), nextReadings].join('\n');
}
