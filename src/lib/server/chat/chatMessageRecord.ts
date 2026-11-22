import { parsePostedVia } from '$lib/data/conversationTurn';
import type { ChatMessage } from '$lib/data/chat/chatMessageRules';

export const chatMessagesTable = 'chat_messages';

export const chatMessageColumns = 'id, room_id, author_account_id, body, posted_via, created_at';

export type ChatMessageRow = {
	id: string;
	room_id: string;
	author_account_id: string;
	body: string;
	posted_via: string;
	created_at: string;
};

export function chatMessageOf(row: ChatMessageRow): ChatMessage {
	return {
		id: row.id,
		roomId: row.room_id,
		authorAccountId: row.author_account_id,
		body: row.body,
		postedVia: parsePostedVia(row.posted_via),
		createdAt: row.created_at
	};
}
