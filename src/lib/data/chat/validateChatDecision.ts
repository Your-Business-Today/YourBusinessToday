import { validateRecordId } from '$lib/data/isUuid';
import { trimmedText } from '$lib/data/trimmedText';
import { chatDecisionLimits, chatDecisionRefusals, type ChatDecisionClosing, type ChatDecisionRaising } from './chatDecisionRules';
import type { ChatRoom } from './chatRoomRules';
import { chatMessageRefusals } from './chatMessageRules';

const refusals = chatDecisionRefusals;
const fewestCharacters = 1;

/** The text trimmed when it is text of 1 to the longest characters, or null when it is not. */
function fittingText(value: unknown, longest: number): string | null {
	if (typeof value !== 'string') return null;
	const text = value.trim();
	const isFitting = text.length >= fewestCharacters && text.length <= longest;
	if (!isFitting) return null;
	return text;
}

/** The message, the wording and who the decision waits on, or the sentence naming what does not fit. */
export function validateDecisionRaising(input: Record<string, unknown>): ChatDecisionRaising | string {
	const messageId = trimmedText(input.messageId);
	const messageRefusal = validateRecordId('message', messageId);
	if (messageRefusal !== null) return messageRefusal;
	const wording = fittingText(input.wording, chatDecisionLimits.longestWording);
	if (wording === null) return refusals.wording;
	const waitingOn = typeof input.waitingOn === 'string' ? input.waitingOn.trim() : '';
	if (waitingOn === '') return refusals.waitingOn;
	return { messageId, wording, waitingOn };
}

/** The decision and the outcome it is closed with, or the sentence naming what does not fit. */
export function validateDecisionClosing(input: Record<string, unknown>): ChatDecisionClosing | string {
	const decisionId = trimmedText(input.decisionId);
	const decisionRefusal = validateRecordId('decision', decisionId);
	if (decisionRefusal !== null) return decisionRefusal;
	const outcome = fittingText(input.outcome, chatDecisionLimits.longestOutcome);
	if (outcome === null) return refusals.outcome;
	return { decisionId, outcome };
}

/** Why no decision can be raised in the room, or null when it is open. */
export function raisingRefusal(room: ChatRoom | undefined): string | null {
	if (room === undefined) return chatMessageRefusals.noSuchRoom;
	if (room.isArchived) return refusals.archivedRoom;
	return null;
}
