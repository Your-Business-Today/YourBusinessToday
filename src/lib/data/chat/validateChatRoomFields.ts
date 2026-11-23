import { checkRequiredWords, textLeftOutAsBlank } from '$lib/data/fieldChecks';
import { validateRecordId } from '$lib/data/isUuid';
import { chatRoomFieldRefusals, chatRoomLimits, type ChatRoomFields } from './chatRoomRules';

const { longestName, longestPurpose } = chatRoomLimits;
const noParent = '';
const parentFieldName = 'room it sits under';

/** The room as given, each field checked against its column, or the sentence naming the one that does not fit. */
export function validateChatRoomFields(input: Record<string, unknown>): ChatRoomFields | string {
	const name = checkRequiredWords(input.name, longestName, chatRoomFieldRefusals.name);
	if ('refusal' in name) return name.refusal;
	const purpose = textLeftOutAsBlank(input.purpose);
	if (purpose === null || purpose.length > longestPurpose) return chatRoomFieldRefusals.purpose;
	const parentRoomId = textLeftOutAsBlank(input.parentRoomId);
	if (parentRoomId === noParent) return { name: name.value, purpose, parentRoomId: null };
	const parentRefusal = validateRecordId(parentFieldName, parentRoomId ?? noParent);
	if (parentRefusal !== null) return parentRefusal;
	return { name: name.value, purpose, parentRoomId };
}
