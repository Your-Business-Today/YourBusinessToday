import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';
import { chatMoveLimits, chatMoveRefusals, type ChatMoveChoice } from './chatMoveRules';

/** A move as the form sends it: every ticked message's id, and the room chosen. */
export type ChatMoveInput = { messageIds: unknown[]; toRoomId: unknown };

/** Why that many messages cannot move in one go, or null when they can; the form asks it too. */
export function chosenCountRefusal(chosenCount: number): string | null {
	if (chosenCount === 0) return chatMoveRefusals.noMessages;
	if (chosenCount > chatMoveLimits.mostMessagesInOneMove) return chatMoveRefusals.tooMany;
	return null;
}

function firstIdRefusal(messageIds: string[]): string | null {
	const refusals = messageIds.map((messageId) => validateRecordId('message', messageId));
	return refusals.find((refusal) => refusal !== null) ?? null;
}

/** The messages chosen, each once, and the room to send them to, or the sentence naming what does not fit. */
export function validateChatMove(input: ChatMoveInput): ChatMoveChoice | string {
	const messageIds = [...new Set(input.messageIds.map(trimmedText))];
	const countRefusal = chosenCountRefusal(messageIds.length);
	if (countRefusal !== null) return countRefusal;
	const idRefusal = firstIdRefusal(messageIds);
	if (idRefusal !== null) return idRefusal;
	const toRoomId = trimmedText(input.toRoomId);
	const roomRefusal = validateRecordId('room to move them to', toRoomId);
	if (roomRefusal !== null) return roomRefusal;
	return { messageIds, toRoomId };
}
