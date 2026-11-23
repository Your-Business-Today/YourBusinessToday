import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { chatRoomTree } from '$lib/data/chat/chatRoomTree';
import { unreadCountsByRoom, withUnreadCounts, type ChatRoomWithUnread, type ChatUnreadCountRow } from '$lib/data/chat/chatUnreadCounts';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** How many messages are new to the visitor in each room of the organisation; none while migration 0272 has not run. */
export async function readChatUnreadCounts(supabase: SupabaseClient, organisationId: string): Promise<Map<string, number>> {
	const { data, error } = await supabase.rpc('chat_unread_counts', { organisation: organisationId });
	if (isSchemaNotYetMigrated(error)) return new Map();
	if (error !== null) throw error;
	return unreadCountsByRoom(data as ChatUnreadCountRow[]);
}

/**
 * How many messages are new to the reader the connector names, in each room of the organisation, by the one rule the
 * site counts by (migration 0274). The service role alone may ask it, once the reader's own module gate has let them in.
 */
export async function readUnreadCountsOfReader(serviceSupabase: SupabaseClient, reader: ChatRoomKeeper): Promise<Map<string, number>> {
	const { data, error } = await serviceSupabase.rpc('chat_unread_counts_for_reader', {
		organisation: reader.organisationId,
		reader: reader.accountId
	});
	if (error !== null) throw error;
	return unreadCountsByRoom(data as ChatUnreadCountRow[]);
}

/** Every room not archived, as the chat's room lists show them, each with how much is new to the visitor. */
export async function listChatRoomsWithUnread(supabase: SupabaseClient, organisationId: string, rooms: ChatRoom[]): Promise<ChatRoomWithUnread[]> {
	const counts = await readChatUnreadCounts(supabase, organisationId);
	return withUnreadCounts(chatRoomTree(rooms), counts);
}

/** The same list, with how much is new to the reader the connector names. */
export async function listChatRoomsForReader(serviceSupabase: SupabaseClient, reader: ChatRoomKeeper, rooms: ChatRoom[]): Promise<ChatRoomWithUnread[]> {
	const counts = await readUnreadCountsOfReader(serviceSupabase, reader);
	return withUnreadCounts(chatRoomTree(rooms), counts);
}
