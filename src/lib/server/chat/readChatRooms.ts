import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { chatRoomColumns, chatRoomOf, chatRoomsTable, type ChatRoomRow } from './chatRoomRecord';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Every room the organisation has kept, archived ones among them; none while migration 0270 has not run. */
export async function readChatRooms(supabase: SupabaseClient, organisationId: string): Promise<ChatRoom[]> {
	const { data, error } = await supabase.from(chatRoomsTable).select(chatRoomColumns).eq('organisation_id', organisationId);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error !== null) throw error;
	return (data as unknown as ChatRoomRow[]).map(chatRoomOf);
}
