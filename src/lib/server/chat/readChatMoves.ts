import { chatMessageLimits } from '$lib/data/chat/chatMessageRules';
import { chatMoveColumns, chatMoveOf, chatMovesTable, type ChatMoveRow } from './chatMoveRecord';
import type { ChatMove } from '$lib/data/chat/chatMoveRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The latest moves out of the room, as many as the room shows messages, read as the visitor reads them. */
export async function readMovesOutOfRoom(supabase: SupabaseClient, roomId: string): Promise<ChatMove[]> {
	const { data, error } = await supabase
		.from(chatMovesTable)
		.select(chatMoveColumns)
		.eq('from_room_id', roomId)
		.order('moved_at', { ascending: false })
		.limit(chatMessageLimits.latestMessagesShown);
	if (error !== null) throw error;
	return (data as ChatMoveRow[]).map(chatMoveOf);
}

/** The moves of these ids: the ones that brought the room's messages to it. */
export async function readMovesByIds(supabase: SupabaseClient, moveIds: string[]): Promise<ChatMove[]> {
	if (moveIds.length === 0) return [];
	const { data, error } = await supabase.from(chatMovesTable).select(chatMoveColumns).in('id', moveIds);
	if (error !== null) throw error;
	return (data as ChatMoveRow[]).map(chatMoveOf);
}
