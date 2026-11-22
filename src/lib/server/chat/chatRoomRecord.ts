import type { ChatRoom } from '$lib/data/chat/chatRoomRules';

export const chatRoomsTable = 'chat_rooms';

export const chatRoomColumns = 'id, name, purpose, parent_room_id, is_general, archived_at';

/** Two rooms sharing a parent and a name, or a second General room: the unique rules of migration 0270. */
export const uniqueViolation = '23505';

/** Whose organisation's chat a write is for, and who makes it. */
export type ChatRoomKeeper = { organisationId: string; accountId: string };

export type ChatRoomRow = {
	id: string;
	name: string;
	purpose: string;
	parent_room_id: string | null;
	is_general: boolean;
	archived_at: string | null;
};

export function chatRoomOf(row: ChatRoomRow): ChatRoom {
	return {
		id: row.id,
		name: row.name,
		purpose: row.purpose,
		parentRoomId: row.parent_room_id,
		isGeneral: row.is_general,
		isArchived: row.archived_at !== null
	};
}
