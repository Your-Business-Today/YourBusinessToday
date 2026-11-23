import { chatWhiteboardOf, chatWhiteboardsTable, openedWhiteboardColumns, type OpenedWhiteboardRow } from './chatWhiteboardRecord';
import { nameWhiteboard } from './nameChatWhiteboards';
import type { ChatWhiteboard, OpenedChatWhiteboard, WhiteboardItem } from '$lib/data/chat/chatWhiteboardRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Which board is asked for: by its id, in that room of that organisation. */
export type WhiteboardAsked = { organisationId: string; roomId: string; whiteboardId: string };

type BoardWithItems = ChatWhiteboard & { items: WhiteboardItem[] };

/** The board of that id in that room of the organisation, with what is on it, or null when the room has none such. */
export async function findWhiteboard(supabase: SupabaseClient, asked: WhiteboardAsked): Promise<BoardWithItems | null> {
	const { data, error } = await supabase
		.from(chatWhiteboardsTable)
		.select(openedWhiteboardColumns)
		.eq('id', asked.whiteboardId)
		.eq('organisation_id', asked.organisationId)
		.eq('room_id', asked.roomId)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	const row = data as OpenedWhiteboardRow;
	return { ...chatWhiteboardOf(row), items: row.strokes };
}

/** The board opened to be drawn on, with who saved it last named, or null when the room has none of that id. */
export async function openWhiteboard(supabase: SupabaseClient, asked: WhiteboardAsked): Promise<OpenedChatWhiteboard | null> {
	const board = await findWhiteboard(supabase, asked);
	if (board === null) return null;
	return nameWhiteboard(board);
}
