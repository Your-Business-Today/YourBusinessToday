import type { ChatRoom, ChatRoomFields } from './chatRoomRules';

export const chatRoomPlacementRefusals = {
	roomNotListed: 'No room of this organisation that is not archived has that id; list the rooms for their ids.',
	parentNotListed: 'A room sits only under one of the organisation’s rooms that sits under nothing and is not archived.',
	underItself: 'A room does not sit under itself.',
	hasSubrooms: 'A room that has subrooms, archived ones among them, does not sit under another room.',
	generalSitsUnderNothing: 'The General room sits under no other room.',
	generalKeepsItsName: 'The General room keeps its name.',
	generalIsNeverArchived: 'The General room is never archived.'
} as const;

const refusals = chatRoomPlacementRefusals;

/** The room of that id when it is one of the rooms not archived. */
export function listedRoomOf(rooms: ChatRoom[], roomId: string): ChatRoom | undefined {
	return rooms.find((room) => room.id === roomId && !room.isArchived);
}

/** Why a room cannot sit under the room asked for, or null when it can. */
export function parentRefusal(rooms: ChatRoom[], parentRoomId: string | null): string | null {
	if (parentRoomId === null) return null;
	const parent = listedRoomOf(rooms, parentRoomId);
	if (parent === undefined || parent.parentRoomId !== null) return refusals.parentNotListed;
	return null;
}

function generalChangeRefusal(general: ChatRoom, fields: ChatRoomFields): string | null {
	if (fields.parentRoomId !== null) return refusals.generalSitsUnderNothing;
	if (fields.name !== general.name) return refusals.generalKeepsItsName;
	return null;
}

/** Why the room cannot be changed to the fields given, or null when it can. */
export function changeRefusal(rooms: ChatRoom[], roomId: string, fields: ChatRoomFields): string | null {
	const room = listedRoomOf(rooms, roomId);
	if (room === undefined) return refusals.roomNotListed;
	if (room.isGeneral) return generalChangeRefusal(room, fields);
	if (fields.parentRoomId === null) return null;
	if (fields.parentRoomId === room.id) return refusals.underItself;
	const hasSubrooms = rooms.some((other) => other.parentRoomId === room.id);
	if (hasSubrooms) return refusals.hasSubrooms;
	return parentRefusal(rooms, fields.parentRoomId);
}

function stillHasSubrooms(room: ChatRoom, openSubrooms: ChatRoom[]): string {
	const names = openSubrooms.map((subroom) => subroom.name).join(', ');
	return `${room.name} still has subrooms that are not archived (${names}): archive them, or put them under another room, first.`;
}

/** Why the room cannot be archived, or null when it can. Archiving a room archives nothing else. */
export function archiveRefusal(rooms: ChatRoom[], roomId: string): string | null {
	const room = listedRoomOf(rooms, roomId);
	if (room === undefined) return refusals.roomNotListed;
	if (room.isGeneral) return refusals.generalIsNeverArchived;
	const openSubrooms = rooms.filter((other) => other.parentRoomId === room.id && !other.isArchived);
	if (openSubrooms.length === 0) return null;
	return stillHasSubrooms(room, openSubrooms);
}
