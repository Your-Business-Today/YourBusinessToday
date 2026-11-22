import { chatReadingLimits, chatReadingSpans } from '$lib/data/chat/chatReadingRules';
import { listChatRoomsForReader } from './readChatUnreadCounts';
import { readChatRooms } from './readChatRooms';
import { readRoomForReader, type ChatRoomReading } from './readChatRoomAsAsked';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

const nothingNew = 0;
const unreadAsUsual = { since: chatReadingSpans.unread, limit: chatReadingLimits.usualMessagesRead };

/**
 * Everything new to the reader in their organisation's chat, room by room in the order the rooms are listed, leaving
 * out the rooms with nothing new. Nothing is marked read.
 */
export async function readUnreadInEveryRoom(serviceSupabase: SupabaseClient, reader: ChatRoomKeeper): Promise<ChatRoomReading[]> {
	const rooms = await readChatRooms(serviceSupabase, reader.organisationId);
	const listedRooms = await listChatRoomsForReader(serviceSupabase, reader, rooms);
	const roomsWithNews = listedRooms.filter((room) => room.unreadCount > nothingNew);
	return Promise.all(roomsWithNews.map((room) => readRoomForReader(serviceSupabase, reader, room, rooms, unreadAsUsual)));
}
