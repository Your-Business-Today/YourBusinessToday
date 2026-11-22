import type { SupabaseClient } from '@supabase/supabase-js';

/** Moves the reader's place in the room to now and marks their notification for it read, in one step. */
export async function markChatRoomRead(serviceSupabase: SupabaseClient, readerId: string, roomId: string): Promise<void> {
	const { error } = await serviceSupabase.rpc('mark_chat_room_read', { reader: readerId, room: roomId });
	if (error !== null) throw error;
}
