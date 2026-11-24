import type { ChatWhiteboard, WhiteboardItem } from '$lib/data/chat/chatWhiteboardRules';

export const chatWhiteboardsTable = 'chat_whiteboards';

/** The columns a list of boards reads: everything but the drawing, which only the board page opens. */
export const chatWhiteboardColumns = 'id, room_id, title, last_saved_by_account_id, created_by_account_id, created_at, updated_at';

/** The columns the board page reads: the drawing too. */
export const openedWhiteboardColumns = `${chatWhiteboardColumns}, strokes`;

export type ChatWhiteboardRow = {
	id: string;
	room_id: string;
	title: string;
	last_saved_by_account_id: string;
	created_by_account_id: string;
	created_at: string;
	updated_at: string;
};

export type OpenedWhiteboardRow = ChatWhiteboardRow & { strokes: WhiteboardItem[] };

export function chatWhiteboardOf(row: ChatWhiteboardRow): ChatWhiteboard {
	return {
		id: row.id,
		roomId: row.room_id,
		title: row.title,
		lastSavedByAccountId: row.last_saved_by_account_id,
		createdByAccountId: row.created_by_account_id,
		createdAt: row.created_at,
		updatedAt: row.updated_at
	};
}
