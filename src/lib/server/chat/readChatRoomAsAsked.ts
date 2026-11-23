import { chatFlowWithin, type ChatFlowRead, type ChatReadingWindow } from '$lib/data/chat/chatFlowWithin';
import { chatMessageLimits, chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import { chatReadingSpans, type ChatReadingAsked, type ChatReadingSince } from '$lib/data/chat/chatReadingRules';
import { validateChatReading } from '$lib/data/chat/validateChatReading';
import { readChatFlowOfRoom, type ChatRoomMessage } from './readChatFlowOfRoom';
import { readChatRooms } from './readChatRooms';
import { findLatestSummaryOfRoom } from './findLatestChatSummary';
import type { NamedChatSummary } from '$lib/data/chat/chatSummaryRules';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

/** One room as a reading gives it: the room, what the reading spans, its lines oldest first, and its latest catch-up. */
export type ChatRoomReading = ChatFlowRead<ChatRoomMessage> & { room: ChatRoom; since: ChatReadingSince; latestSummary: NamedChatSummary | null };

type UnreadMessageRow = { message_id: string };

async function unreadMessageIdsInRoom(serviceSupabase: SupabaseClient, reader: ChatRoomKeeper, roomId: string): Promise<Set<string>> {
	const { data, error } = await serviceSupabase
		.rpc('chat_unread_messages_for_reader', { organisation: reader.organisationId, reader: reader.accountId })
		.eq('room_id', roomId)
		.order('created_at', { ascending: false })
		.limit(chatMessageLimits.latestMessagesShown);
	if (error !== null) throw error;
	return new Set((data as UnreadMessageRow[]).map((row) => row.message_id));
}

/** The moment the reader had read the room up to, or null when they have never opened it. */
export async function placeInRoom(serviceSupabase: SupabaseClient, reader: ChatRoomKeeper, roomId: string): Promise<string | null> {
	const { data, error } = await serviceSupabase
		.from('chat_room_reads')
		.select('read_up_to')
		.eq('account_id', reader.accountId)
		.eq('room_id', roomId)
		.maybeSingle();
	if (error !== null) throw error;
	return (data?.read_up_to as string | undefined) ?? null;
}

async function windowFor(serviceSupabase: SupabaseClient, reader: ChatRoomKeeper, roomId: string, asked: ChatReadingAsked): Promise<ChatReadingWindow> {
	const { limit } = asked;
	if (asked.since === chatReadingSpans.all) return { unreadMessageIds: null, readUpTo: null, limit };
	const [unreadMessageIds, readUpTo] = await Promise.all([
		unreadMessageIdsInRoom(serviceSupabase, reader, roomId),
		placeInRoom(serviceSupabase, reader, roomId)
	]);
	return { unreadMessageIds, readUpTo, limit };
}

/**
 * The room read as the reader asks, through the service role: the room's flow as the site shows it, cut to what is
 * new to them when they ask for that, with the room's latest catch-up. Nothing is marked read: the reader's place and their notification stay.
 */
export async function readRoomForReader(
	serviceSupabase: SupabaseClient,
	reader: ChatRoomKeeper,
	room: ChatRoom,
	rooms: ChatRoom[],
	asked: ChatReadingAsked
): Promise<ChatRoomReading> {
	const [flow, window, latestSummary] = await Promise.all([
		readChatFlowOfRoom(serviceSupabase, room.id, rooms),
		windowFor(serviceSupabase, reader, room.id, asked),
		findLatestSummaryOfRoom(serviceSupabase, room.id)
	]);
	return { ...chatFlowWithin(flow, window), room, since: asked.since, latestSummary };
}

/** One room of the reader's organisation, archived or not, read as they ask once what they ask fits, or why not. */
export async function readChatRoomAsAsked(
	serviceSupabase: SupabaseClient,
	reader: ChatRoomKeeper,
	roomId: string,
	input: Record<string, unknown>
): Promise<ChatRoomReading | string> {
	const asked = validateChatReading(input);
	if (typeof asked === 'string') return asked;
	const rooms = await readChatRooms(serviceSupabase, reader.organisationId);
	const room = rooms.find((candidate) => candidate.id === roomId);
	if (room === undefined) return chatMessageRefusals.noSuchRoom;
	return readRoomForReader(serviceSupabase, reader, room, rooms, asked);
}
