import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';
import { chatRoomFieldRefusals, chatRoomLimits, type ChatRoomFields } from './chatRoomRules';

const { longestName, longestPurpose } = chatRoomLimits;
const noParent = '';

/** The room as given, each field checked against its column, or the sentence naming the one that does not fit. */
export function validateChatRoomFields(input: Record<string, unknown>): ChatRoomFields | string {
	const name = trimmedText(input.name);
	if (name === '' || name.length > longestName) return chatRoomFieldRefusals.name;
	const purpose = trimmedText(input.purpose);
	if (purpose.length > longestPurpose) return chatRoomFieldRefusals.purpose;
	const parentRoomId = trimmedText(input.parentRoomId);
	if (parentRoomId === noParent) return { name, purpose, parentRoomId: null };
	const parentRefusal = validateRecordId('room it sits under', parentRoomId);
	if (parentRefusal !== null) return parentRefusal;
	return { name, purpose, parentRoomId };
}
