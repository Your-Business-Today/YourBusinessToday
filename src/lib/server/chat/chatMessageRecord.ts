import { parsePostedVia } from '$lib/data/conversationTurn';
import type { ChatMessage } from '$lib/data/chat/chatMessageRules';

export const chatMessagesTable = 'chat_messages';

export const chatMessageColumns = 'id, room_id, author_account_id, body, posted_via, created_at';

/** The columns a room reads, with the move that brought each message here: migration 0273's column. */
export const roomMessageColumns = `${chatMessageColumns}, moved_by_move_id`;

export type ChatMessageRow = {
	id: string;
	room_id: string;
	author_account_id: string;
	body: string;
	posted_via: string;
	created_at: string;
	moved_by_move_id?: string | null;
};

/** The message as its own row has it; the files it carries are read beside it, from chat_message_files. */
export function chatMessageOf(row: ChatMessageRow): ChatMessage {
	return {
		id: row.id,
		roomId: row.room_id,
		authorAccountId: row.author_account_id,
		body: row.body,
		postedVia: parsePostedVia(row.posted_via),
		createdAt: row.created_at,
		movedByMoveId: row.moved_by_move_id ?? null,
		files: []
	};
}
