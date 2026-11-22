import type { ChatRoom } from './chatRoomRules';

/** An organisation whose chat has never had a room, archived or not, is given the template rooms on its first visit. */
export function needsTemplateRooms(rooms: ChatRoom[]): boolean {
	return rooms.length === 0;
}
