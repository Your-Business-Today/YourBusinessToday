import { validateWhiteboardTitle, whiteboardRoomRefusal } from '$lib/data/chat/validateChatWhiteboard';
import { readChatRooms } from './readChatRooms';
import { chatWhiteboardColumns, chatWhiteboardOf, chatWhiteboardsTable, type ChatWhiteboardRow } from './chatWhiteboardRecord';
import type { ChatWhiteboard } from '$lib/data/chat/chatWhiteboardRules';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Writes a blank board in the room, its starter its first saver too. */
async function writeWhiteboard(serviceSupabase: SupabaseClient, starter: ChatRoomKeeper, roomId: string, title: string): Promise<ChatWhiteboard> {
	const row = {
		organisation_id: starter.organisationId,
		room_id: roomId,
		title,
		strokes: [],
		last_saved_by_account_id: starter.accountId,
		created_by_account_id: starter.accountId
	};
	const { data, error } = await serviceSupabase.from(chatWhiteboardsTable).insert(row).select(chatWhiteboardColumns).single();
	if (error !== null) throw error;
	return chatWhiteboardOf(data as ChatWhiteboardRow);
}

/**
 * Starts a blank whiteboard in the room, once its title fits its column and the room is one of the organisation's and
 * open; or says why not. Nothing is posted in the room until the board is.
 */
export async function createChatWhiteboard(
	serviceSupabase: SupabaseClient,
	starter: ChatRoomKeeper,
	roomId: string,
	input: Record<string, unknown>
): Promise<ChatWhiteboard | string> {
	const titled = validateWhiteboardTitle(input.title);
	if (typeof titled === 'string') return titled;
	const rooms = await readChatRooms(serviceSupabase, starter.organisationId);
	const refusal = whiteboardRoomRefusal(rooms.find((room) => room.id === roomId));
	if (refusal !== null) return refusal;
	return writeWhiteboard(serviceSupabase, starter, roomId, titled.title);
}
