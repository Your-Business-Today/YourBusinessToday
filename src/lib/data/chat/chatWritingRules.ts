import type { ChatMoveInput } from './validateChatMove';
import type { ChatRoom } from './chatRoomRules';

/** The fields of a room a change over the connector may give; each one left out keeps what the room has. */
export const changeableRoomFields = ['name', 'purpose', 'parentRoomId'] as const;

/** What an update of a room asks: to archive it, as the site's Archive does, or to change the fields given, as its Edit does. */
export type ChatRoomUpdateAsked = { isArchiving: true } | { isArchiving: false; changes: Record<string, unknown> };

/** What the connector's writes refuse beyond the page's own refusals, each by the field it names. */
export const chatWritingRefusals = {
	isArchived: 'isArchived is true to archive the room, or left out: an archived room is never brought back, on the site or here.',
	archiveAlone: 'Archive a room in a call of its own, changing nothing else in it, as the site archives it.',
	nothingAsked: 'Give at least one of name, purpose, parentRoomId or isArchived.',
	messagesNotAList: 'messageIds is a list of the messages to move, each as read_chat_room gives it.'
} as const;

const refusals = chatWritingRefusals;
const noParent = '';

function changesGiven(input: Record<string, unknown>): Record<string, unknown> {
	const givenFields = changeableRoomFields.filter((field) => input[field] !== undefined);
	return Object.fromEntries(givenFields.map((field) => [field, input[field]]));
}

/** Whether the update archives the room or changes the fields given, or the sentence naming what does not fit. */
export function validateChatRoomUpdate(input: Record<string, unknown>): ChatRoomUpdateAsked | string {
	const changes = changesGiven(input);
	const hasChanges = Object.keys(changes).length > 0;
	const isArchivedLeftOut = input.isArchived === undefined;
	if (isArchivedLeftOut && !hasChanges) return refusals.nothingAsked;
	if (isArchivedLeftOut) return { isArchiving: false, changes };
	if (input.isArchived !== true) return refusals.isArchived;
	if (hasChanges) return refusals.archiveAlone;
	return { isArchiving: true };
}

/** The room's fields as its Edit form would send them, with the changes given laid over what it has now. */
export function roomFieldsWithChanges(room: ChatRoom, changes: Record<string, unknown>): Record<string, unknown> {
	const kept = { roomId: room.id, name: room.name, purpose: room.purpose, parentRoomId: room.parentRoomId ?? noParent };
	return { ...kept, ...changes };
}

/** The move as the page's move takes it, once the messages are given as a list, or the sentence saying they are not. */
export function validateMoveOverConnector(input: Record<string, unknown>): ChatMoveInput | string {
	const { messageIds, toRoomId } = input;
	if (!Array.isArray(messageIds)) return refusals.messagesNotAList;
	return { messageIds, toRoomId };
}
