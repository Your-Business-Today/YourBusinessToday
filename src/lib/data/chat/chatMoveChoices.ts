import { chatMoveRefusals } from './chatMoveRules';
import type { ChatRoom } from './chatRoomRules';
import type { ListedChatRoom } from './chatRoomTree';

const notListed = -1;

/** The message picked and every one after it in the room, in the room's order; nothing when it is not there. */
export function messagesFromHereOnwards<Message extends { id: string }>(messages: Message[], pickedMessageId: string): Message[] {
	const pickedPlace = messages.findIndex((message) => message.id === pickedMessageId);
	if (pickedPlace === notListed) return [];
	return messages.slice(pickedPlace);
}

/** Why the messages cannot go from the one room to the other, or null when they can. */
export function destinationRefusal(rooms: ChatRoom[], fromRoomId: string, toRoomId: string): string | null {
	if (toRoomId === fromRoomId) return chatMoveRefusals.sameRoom;
	const destination = rooms.find((room) => room.id === toRoomId);
	if (destination === undefined) return chatMoveRefusals.destinationNotListed;
	if (destination.isArchived) return chatMoveRefusals.destinationArchived;
	return null;
}

/** The rooms messages may go to: every listed room but this one, each subroom beneath its room. */
export function moveDestinations(listedRooms: ListedChatRoom[], roomId: string): ListedChatRoom[] {
	return listedRooms.filter((room) => room.id !== roomId && !room.isArchived);
}
