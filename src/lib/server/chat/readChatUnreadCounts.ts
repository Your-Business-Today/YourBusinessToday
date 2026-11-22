import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { chatRoomTree } from '$lib/data/chat/chatRoomTree';
import { unreadCountsByRoom, withUnreadCounts, type ChatRoomWithUnread, type ChatUnreadCountRow } from '$lib/data/chat/chatUnreadCounts';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** How many messages are new to the visitor in each room of the organisation; none while migration 0272 has not run. */
export async function readChatUnreadCounts(supabase: SupabaseClient, organisationId: string): Promise<Map<string, number>> {
	const { data, error } = await supabase.rpc('chat_unread_counts', { organisation: organisationId });
	if (isSchemaNotYetMigrated(error)) return new Map();
	if (error !== null) throw error;
	return unreadCountsByRoom(data as ChatUnreadCountRow[]);
}

/** Every room not archived, as the chat's room lists show them, each with how much is new to the visitor. */
export async function listChatRoomsWithUnread(supabase: SupabaseClient, organisationId: string, rooms: ChatRoom[]): Promise<ChatRoomWithUnread[]> {
	const counts = await readChatUnreadCounts(supabase, organisationId);
	return withUnreadCounts(chatRoomTree(rooms), counts);
}
