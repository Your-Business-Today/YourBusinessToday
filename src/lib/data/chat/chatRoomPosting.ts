import { chatMessageRefusals } from './chatMessageRules';
import type { ChatRoom } from './chatRoomRules';

/** Why nothing can be said in the room, or null when it is open to be talked in. */
export function postingRefusal(room: ChatRoom | undefined): string | null {
	if (room === undefined) return chatMessageRefusals.noSuchRoom;
	if (room.isArchived) return chatMessageRefusals.archivedRoom;
	return null;
}
