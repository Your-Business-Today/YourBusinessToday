import { validateRecordId } from '$lib/data/isUuid';
import { chatDecisionRefusals } from '$lib/data/chat/chatDecisionRules';
import { chatFileRefusals } from '$lib/data/chat/chatFileRules';
import { chatMessageRefusals } from '$lib/data/chat/chatMessageRules';
import { chatMoveRefusals } from '$lib/data/chat/chatMoveRules';
import { chatRoomPlacementRefusals } from '$lib/data/chat/chatRoomPlacement';
import { chatRoomFieldRefusals } from '$lib/data/chat/chatRoomRules';
import { chatSummaryRefusals } from '$lib/data/chat/chatSummaryRules';

const listTheRooms = 'Call list_chat_rooms for the rooms of this organisation and their ids.';
const listTheDecisions = 'Call list_chat_decisions for the decisions of this organisation and their ids.';
const notAnId = '';

function notAnIdRefusal(fieldName: string): string {
	return validateRecordId(fieldName, notAnId) ?? notAnId;
}

const roomNotFoundRefusals = new Set<string>([
	chatMessageRefusals.noSuchRoom,
	chatRoomPlacementRefusals.roomNotListed,
	chatMoveRefusals.destinationNotListed
]);

const fieldsByRefusal = new Map<string, string>([
	[chatMessageRefusals.body, 'body'],
	[chatFileRefusals.wordsOrFiles, 'body'],
	[chatRoomFieldRefusals.name, 'name'],
	[chatRoomFieldRefusals.purpose, 'purpose'],
	[chatSummaryRefusals.words, 'words'],
	[chatSummaryRefusals.coversUpTo, 'coversUpTo'],
	[chatSummaryRefusals.coversTheFuture, 'coversUpTo'],
	[chatSummaryRefusals.coversPastTheLatest, 'coversUpTo'],
	[chatDecisionRefusals.wording, 'wording'],
	[chatDecisionRefusals.outcome, 'outcome'],
	[chatDecisionRefusals.waitingOn, 'waitingOn'],
	[chatDecisionRefusals.notAPerson, 'waitingOn'],
	[chatDecisionRefusals.messageNotInRoom, 'messageId'],
	[notAnIdRefusal('message'), 'messageId'],
	[notAnIdRefusal('decision'), 'decisionId']
]);

/**
 * A refusal of the chat's rules as the connector gives it: led by the input field it refuses, and pointing at the
 * list of rooms, or of decisions, when the one named is not the organisation's.
 */
export function chatConnectorRefusal(refusal: string): string {
	if (roomNotFoundRefusals.has(refusal)) return `${refusal} ${listTheRooms}`;
	if (refusal === chatDecisionRefusals.noSuchDecision) return `decisionId: ${refusal} ${listTheDecisions}`;
	const fieldName = fieldsByRefusal.get(refusal);
	if (fieldName === undefined) return refusal;
	return `${fieldName}: ${refusal}`;
}
