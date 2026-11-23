import { accountNameLookup } from '$lib/data/accountNames';
import { chatRoomFlow, type ChatFlowEntry, type MovedAwayMarker, type MovedHere } from '$lib/data/chat/chatRoomFlow';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { readChatMessages, type NamedChatMessage } from './readChatMessages';
import { readMovesByIds, readMovesOutOfRoom } from './readChatMoves';
import type { ChatMove } from '$lib/data/chat/chatMoveRules';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A message as the room shows it: who said it, and where it came from when it was moved here. */
export type ChatRoomMessage = NamedChatMessage & { movedHere: MovedHere | null };

export type ChatRoomFlowEntry = ChatFlowEntry<ChatRoomMessage>;

/** Names the rooms and the people a move speaks of. */
type MoveNamer = { roomName: (roomId: string) => string; moverName: (accountId: string) => string };

const roomNoLongerKnown = 'another room';

async function moveNamerFor(rooms: ChatRoom[], moves: ChatMove[]): Promise<MoveNamer> {
	const movers = await getAccountsById(supabaseServiceClient(), moves.map((move) => move.movedBy));
	const roomNames = new Map(rooms.map((room) => [room.id, room.name]));
	return { roomName: (roomId) => roomNames.get(roomId) ?? roomNoLongerKnown, moverName: accountNameLookup(movers) };
}

function markerOf(move: ChatMove, namer: MoveNamer): MovedAwayMarker {
	const { id: moveId, toRoomId, messageCount, movedAt } = move;
	return { moveId, toRoomId, messageCount, movedAt, toRoomName: namer.roomName(toRoomId), moverName: namer.moverName(move.movedBy) };
}

function movedHereOf(move: ChatMove | undefined, namer: MoveNamer): MovedHere | null {
	if (move === undefined) return null;
	return { fromRoomName: namer.roomName(move.fromRoomId), moverName: namer.moverName(move.movedBy) };
}

/**
 * The room as it reads: its latest messages oldest first, each moved one with where it came from, and a line for
 * each move out of it where the messages were. Movers are named through the service role, as authors are.
 */
export async function readChatFlowOfRoom(supabase: SupabaseClient, roomId: string, rooms: ChatRoom[]): Promise<ChatRoomFlowEntry[]> {
	const messages = await readChatMessages(supabase, roomId);
	const movedHereIds = [...new Set(messages.flatMap((message) => message.movedByMoveId ?? []))];
	const [movesAway, movesHere] = await Promise.all([readMovesOutOfRoom(supabase, roomId), readMovesByIds(supabase, movedHereIds)]);
	const namer = await moveNamerFor(rooms, [...movesAway, ...movesHere]);
	const movesById = new Map(movesHere.map((move) => [move.id, move]));
	const roomMessages = messages.map((message) => ({ ...message, movedHere: movedHereOf(movesById.get(message.movedByMoveId ?? ''), namer) }));
	return chatRoomFlow(roomMessages, movesAway.map((move) => markerOf(move, namer)));
}
