import { parsePostedVia } from '$lib/data/conversationTurn';
import type { ChatSummary } from '$lib/data/chat/chatSummaryRules';

export const chatSummariesTable = 'chat_room_summaries';

export const chatSummaryColumns = 'id, room_id, covers_up_to, words, written_by_account_id, written_via, created_at';

export type ChatSummaryRow = {
	id: string;
	room_id: string;
	covers_up_to: string;
	words: string;
	written_by_account_id: string;
	written_via: string;
	created_at: string;
};

export function chatSummaryOf(row: ChatSummaryRow): ChatSummary {
	return {
		id: row.id,
		roomId: row.room_id,
		coversUpTo: row.covers_up_to,
		words: row.words,
		writtenByAccountId: row.written_by_account_id,
		writtenVia: parsePostedVia(row.written_via),
		createdAt: row.created_at
	};
}
