import { chatWhiteboardLimits, type ListedChatWhiteboard } from '$lib/data/chat/chatWhiteboardRules';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { chatWhiteboardColumns, chatWhiteboardOf, chatWhiteboardsTable, type ChatWhiteboardRow } from './chatWhiteboardRecord';
import { nameWhiteboards } from './nameChatWhiteboards';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The room's whiteboards, the latest saved first, with who saved each last, read as the reader reads them. None while
 * migration 0278 has not run, since the room asks on every visit.
 */
export async function listWhiteboardsOfRoom(supabase: SupabaseClient, roomId: string): Promise<ListedChatWhiteboard[]> {
	const { data, error } = await supabase
		.from(chatWhiteboardsTable)
		.select(chatWhiteboardColumns)
		.eq('room_id', roomId)
		.order('updated_at', { ascending: false })
		.limit(chatWhiteboardLimits.latestBoardsListed);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error !== null) throw error;
	return nameWhiteboards((data as ChatWhiteboardRow[]).map(chatWhiteboardOf));
}
