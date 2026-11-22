import type { ChatRoom } from './chatRoomRules';

/** A room as the chat home lists it: a subroom is drawn beneath the room it sits under. */
export type ListedChatRoom = ChatRoom & { isSubroom: boolean };

const generalBefore = -1;
const generalAfter = 1;

function byName(first: ChatRoom, second: ChatRoom): number {
	return first.name.localeCompare(second.name, undefined, {
		sensitivity: 'base'
	});
}

function generalFirstThenByName(first: ChatRoom, second: ChatRoom): number {
	if (first.isGeneral) return generalBefore;
	if (second.isGeneral) return generalAfter;
	return byName(first, second);
}

/** The rooms not archived that sit under nothing: General first, then the rest by name. */
export function topLevelRooms(rooms: ChatRoom[]): ChatRoom[] {
	const topLevel = rooms.filter((room) => room.parentRoomId === null && !room.isArchived);
	return topLevel.sort(generalFirstThenByName);
}

function subroomsOf(rooms: ChatRoom[], parent: ChatRoom): ListedChatRoom[] {
	const subrooms = rooms.filter((room) => room.parentRoomId === parent.id && !room.isArchived);
	return subrooms.sort(byName).map((room) => ({ ...room, isSubroom: true }));
}

/** Every room not archived, General first, then each room by name with its subrooms by name beneath it. */
export function chatRoomTree(rooms: ChatRoom[]): ListedChatRoom[] {
	return topLevelRooms(rooms).flatMap((room) => [{ ...room, isSubroom: false }, ...subroomsOf(rooms, room)]);
}
