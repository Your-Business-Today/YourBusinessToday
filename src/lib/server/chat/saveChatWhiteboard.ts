import { chatWhiteboardRefusals, type ChatWhiteboard, type ChatWhiteboardSaving, type ListedChatWhiteboard } from '$lib/data/chat/chatWhiteboardRules';
import { validateWhiteboardSaving, whiteboardRoomRefusal } from '$lib/data/chat/validateChatWhiteboard';
import { savedSinceRefusal } from '$lib/data/chat/chatWhiteboardWords';
import { readChatRooms } from './readChatRooms';
import { findWhiteboard, type WhiteboardAsked } from './readChatWhiteboard';
import { nameWhiteboard } from './nameChatWhiteboards';
import { chatWhiteboardColumns, chatWhiteboardOf, chatWhiteboardsTable, type ChatWhiteboardRow } from './chatWhiteboardRecord';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Whether the board has been saved since the saver opened it: its last save is not the one they opened. */
function isSavedSince(board: ChatWhiteboard, saving: ChatWhiteboardSaving): boolean {
	return Date.parse(board.updatedAt) !== Date.parse(saving.openedAsSavedAt);
}

async function refusalNamingTheLastSaver(board: ChatWhiteboard): Promise<string> {
	const named = await nameWhiteboard(board);
	return savedSinceRefusal(named.lastSavedByName, named.updatedAt);
}

/** Saves the board while its last save is still the one read, or answers null when someone saved it a moment before. */
async function saveWhileUnchanged(serviceSupabase: SupabaseClient, saver: ChatRoomKeeper, board: ChatWhiteboard, saving: ChatWhiteboardSaving): Promise<ChatWhiteboard | null> {
	const change = { title: saving.title, strokes: saving.items, last_saved_by_account_id: saver.accountId, updated_at: new Date().toISOString() };
	const { data, error } = await serviceSupabase
		.from(chatWhiteboardsTable)
		.update(change)
		.eq('id', board.id)
		.eq('organisation_id', saver.organisationId)
		.eq('updated_at', board.updatedAt)
		.select(chatWhiteboardColumns)
		.maybeSingle();
	if (error !== null) throw error;
	if (data === null) return null;
	return chatWhiteboardOf(data as ChatWhiteboardRow);
}

async function savedOrRefusedSince(serviceSupabase: SupabaseClient, saver: ChatRoomKeeper, asked: WhiteboardAsked, saving: ChatWhiteboardSaving): Promise<ListedChatWhiteboard | string> {
	const board = await findWhiteboard(serviceSupabase, asked);
	if (board === null) return chatWhiteboardRefusals.noSuchWhiteboard;
	if (isSavedSince(board, saving)) return refusalNamingTheLastSaver(board);
	const saved = await saveWhileUnchanged(serviceSupabase, saver, board, saving);
	if (saved !== null) return nameWhiteboard(saved);
	const savedMeanwhile = await findWhiteboard(serviceSupabase, asked);
	return refusalNamingTheLastSaver(savedMeanwhile ?? board);
}

/**
 * Saves the board's title and drawing, once both fit the rules, the room is one of the organisation's and open, and
 * nobody has saved the board since the saver opened it. One person draws at a time: a board saved by someone else
 * in the meantime is left as they saved it, and the saver is told who and when, so nothing of either is lost.
 */
export async function saveChatWhiteboard(
	serviceSupabase: SupabaseClient,
	saver: ChatRoomKeeper,
	asked: WhiteboardAsked,
	input: Record<string, unknown>
): Promise<ListedChatWhiteboard | string> {
	const saving = validateWhiteboardSaving(input);
	if (typeof saving === 'string') return saving;
	const rooms = await readChatRooms(serviceSupabase, saver.organisationId);
	const refusal = whiteboardRoomRefusal(rooms.find((room) => room.id === asked.roomId));
	if (refusal !== null) return refusal;
	return savedOrRefusedSince(serviceSupabase, saver, asked, saving);
}
