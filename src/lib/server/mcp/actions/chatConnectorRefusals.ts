import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import { chatMoveRefusals } from '$lib/data/chat/chatMoveRules';
import { chatRoomPlacementRefusals } from '$lib/data/chat/chatRoomPlacement';
import { chatRoomFieldRefusals } from '$lib/data/chat/chatRoomRules';

const listTheRooms = 'Call list_chat_rooms for the rooms of this organisation and their ids.';

const roomNotFoundRefusals = new Set<string>([
	chatMessageRefusals.noSuchRoom,
	chatRoomPlacementRefusals.roomNotListed,
	chatMoveRefusals.destinationNotListed
]);

const fieldsByRefusal = new Map<string, string>([
	[chatMessageRefusals.body, 'body'],
	[chatRoomFieldRefusals.name, 'name'],
	[chatRoomFieldRefusals.purpose, 'purpose']
]);

/**
 * A refusal of the chat's rules as the connector gives it: led by the input field it refuses, and pointing at the
 * list of rooms when the room named is not one of the organisation's.
 */
export function chatConnectorRefusal(refusal: string): string {
	if (roomNotFoundRefusals.has(refusal)) return `${refusal} ${listTheRooms}`;
	const fieldName = fieldsByRefusal.get(refusal);
	if (fieldName === undefined) return refusal;
	return `${fieldName}: ${refusal}`;
}
