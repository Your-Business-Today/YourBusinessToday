/** The limit on a move, stated once and mirrored by the check on migration 0273's message_count and its function. */
export const chatMoveLimits = {
	mostMessagesInOneMove: 200
} as const;

/** One move of messages from one room of an organisation to another, as chat_moves keeps it. */
export type ChatMove = {
	id: string;
	fromRoomId: string;
	toRoomId: string;
	movedBy: string;
	messageCount: number;
	movedAt: string;
};

/** What the reader asks for: the messages they chose and the room to send them to, checked by validateChatMove. */
export type ChatMoveChoice = { messageIds: string[]; toRoomId: string };

/** Every refusal of a move, in the same words move_chat_messages raises, so a refusal reads the same from either. */
export const chatMoveRefusals = {
	noMessages: 'Choose at least one message to move.',
	tooMany: `At most ${chatMoveLimits.mostMessagesInOneMove} messages move in one go; move the rest in another.`,
	notInThisRoom: 'Every message moved must be one in this room; read the room again and choose again.',
	sameRoom: 'The messages are in this room already; choose another room to move them to.',
	destinationNotListed: 'No room of this organisation has that id; choose one from the list.',
	destinationArchived: 'That room is archived, so nothing can be moved into it.'
} as const;
