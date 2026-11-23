import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import { readChatRooms } from './readChatRooms';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Moves the reader's place in the room to now and marks their notification for it read, in one step. */
export async function markChatRoomRead(serviceSupabase: SupabaseClient, readerId: string, roomId: string): Promise<void> {
	const { error } = await serviceSupabase.rpc('mark_chat_room_read', { reader: readerId, room: roomId });
	if (error !== null) throw error;
}

/** Marks the room read for the reader once it is a room of their organisation, archived or not, or says why not. */
export async function markRoomReadInOrganisation(serviceSupabase: SupabaseClient, reader: ChatRoomKeeper, roomId: string): Promise<ChatRoom | string> {
	const rooms = await readChatRooms(serviceSupabase, reader.organisationId);
	const room = rooms.find((candidate) => candidate.id === roomId);
	if (room === undefined) return chatMessageRefusals.noSuchRoom;
	await markChatRoomRead(serviceSupabase, reader.accountId, room.id);
	return room;
}
