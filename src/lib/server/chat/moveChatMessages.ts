import { chatMoveRefusals, type ChatMove, type ChatMoveChoice } from '$lib/data/chat/chatMoveRules';
import { destinationRefusal } from '$lib/data/chat/chatMoveChoices';
import { validateChatMove, type ChatMoveInput } from '$lib/data/chat/validateChatMove';
import { readChatRooms } from './readChatRooms';
import { chatMoveOf, type ChatMoveRow } from './chatMoveRecord';
import type { ChatRoom } from '$lib/data/chat/chatRoomRules';
import type { ChatRoomKeeper } from './chatRoomRecord';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';

/** A move made: the record of it, and the room the messages went to. */
export type ChatMoveMade = { move: ChatMove; destination: ChatRoom };

const refusalSentences: string[] = Object.values(chatMoveRefusals);

/** A refusal move_chat_messages raised in the words of the rules, as when a message moved away while it was chosen. */
function raisedRefusal(error: PostgrestError): string | null {
	const isOneOfOurs = refusalSentences.includes(error.message);
	if (isOneOfOurs) return error.message;
	return null;
}

async function moveInOneStep(serviceSupabase: SupabaseClient, mover: ChatRoomKeeper, fromRoomId: string, choice: ChatMoveChoice): Promise<ChatMove | string> {
	const { data, error } = await serviceSupabase.rpc('move_chat_messages', {
		organisation: mover.organisationId,
		from_room: fromRoomId,
		to_room: choice.toRoomId,
		mover: mover.accountId,
		message_ids: choice.messageIds
	});
	if (error === null) return chatMoveOf(data as ChatMoveRow);
	const refusal = raisedRefusal(error);
	if (refusal !== null) return refusal;
	throw error;
}

/**
 * Moves the chosen messages out of the room to another room of the organisation, all of them or none, or says why
 * not. The function the move runs through checks again that every message is in the room they leave.
 */
export async function moveChatMessages(
	serviceSupabase: SupabaseClient,
	mover: ChatRoomKeeper,
	fromRoomId: string,
	input: ChatMoveInput
): Promise<ChatMoveMade | string> {
	const choice = validateChatMove(input);
	if (typeof choice === 'string') return choice;
	const rooms = await readChatRooms(serviceSupabase, mover.organisationId);
	const refusal = destinationRefusal(rooms, fromRoomId, choice.toRoomId);
	if (refusal !== null) return refusal;
	const move = await moveInOneStep(serviceSupabase, mover, fromRoomId, choice);
	if (typeof move === 'string') return move;
	const destination = rooms.find((room) => room.id === move.toRoomId) as ChatRoom;
	return { move, destination };
}
