import { roomFieldsWithChanges, validateChatRoomUpdate } from '$lib/data/chat/chatWritingRules';
import { chatRoomPlacementRefusals, listedRoomOf } from '$lib/data/chat/chatRoomPlacement';
import { trimmedText } from '$lib/data/trimmedText';
import { archiveChatRoom, changeChatRoom } from './keepChatRooms';
import { readChatRooms } from './readChatRooms';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Archives the room through the site's Archive, or changes the fields given through the site's Edit, each field left
 * out keeping what the room has, with every refusal either makes, or says why not.
 */
export async function updateChatRoom(serviceSupabase: SupabaseClient, organisationId: string, input: Record<string, unknown>): Promise<ChatRoom | string> {
	const asked = validateChatRoomUpdate(input);
	if (typeof asked === 'string') return asked;
	const roomId = trimmedText(input.roomId);
	if (asked.isArchiving) return archiveChatRoom(serviceSupabase, organisationId, roomId);
	const rooms = await readChatRooms(serviceSupabase, organisationId);
	const room = listedRoomOf(rooms, roomId);
	if (room === undefined) return chatRoomPlacementRefusals.roomNotListed;
	return changeChatRoom(serviceSupabase, organisationId, roomFieldsWithChanges(room, asked.changes));
}
