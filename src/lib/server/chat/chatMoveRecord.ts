import type { ChatMove } from '$lib/data/chat/chatMoveRules';

export const chatMovesTable = 'chat_moves';

export const chatMoveColumns = 'id, from_room_id, to_room_id, moved_by, message_count, moved_at';

export type ChatMoveRow = {
	id: string;
	from_room_id: string;
	to_room_id: string;
	moved_by: string;
	message_count: number;
	moved_at: string;
};

export function chatMoveOf(row: ChatMoveRow): ChatMove {
	return {
		id: row.id,
		fromRoomId: row.from_room_id,
		toRoomId: row.to_room_id,
		movedBy: row.moved_by,
		messageCount: row.message_count,
		movedAt: row.moved_at
	};
}
