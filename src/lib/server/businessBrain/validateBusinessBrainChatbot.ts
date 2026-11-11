import { businessBrainChatbotLimits, type BusinessBrainChatbotChange, type BusinessBrainChatbotGiven } from '$lib/data/businessBrainChatbotRules';
import { lengthRefusal } from './businessBrainFieldRefusals';
import { trimmedText } from '$lib/data/trimmedText';
import { validatePartList, validatePeopleList } from './validateBusinessBrainChatbotLists';
import { validateRecordId } from '$lib/data/isUuid';

export const noPartsToRead = 'A chatbot reads at least one part of the brain: give parts, such as ["process"].';

export const nothingToChange =
	'Name something to change: purpose, addParts, removeParts, addPeople or removePeople. Nothing was changed.';

const { longestName, longestPurpose } = businessBrainChatbotLimits;

/** A new chatbot checked against its columns, or a sentence naming the value that does not fit. */
export function validateBusinessBrainChatbotMade(input: Record<string, unknown>): BusinessBrainChatbotGiven | string {
	const name = trimmedText(input.name);
	const nameRefusal = lengthRefusal('name', name, longestName, true);
	if (nameRefusal !== null) return nameRefusal;
	const purpose = trimmedText(input.purpose);
	const purposeRefusal = lengthRefusal('purpose', purpose, longestPurpose, false);
	if (purposeRefusal !== null) return purposeRefusal;
	const parts = validatePartList(input, 'parts');
	if (typeof parts === 'string') return parts;
	if (parts.length === 0) return noPartsToRead;
	const people = validatePeopleList(input, 'people');
	if (typeof people === 'string') return people;
	return { name, purpose, parts, people };
}

/** A change to a chatbot checked against its columns, or a sentence naming the value that does not fit. */
export function validateBusinessBrainChatbotChange(input: Record<string, unknown>): BusinessBrainChatbotChange | string {
	const chatbotId = trimmedText(input.chatbotId);
	const idRefusal = validateRecordId('chatbotId', chatbotId);
	if (idRefusal !== null) return idRefusal;
	const purpose = validatePurposeChange(input);
	if (purpose.refusal !== null) return purpose.refusal;
	const addParts = validatePartList(input, 'addParts');
	if (typeof addParts === 'string') return addParts;
	const removeParts = validatePartList(input, 'removeParts');
	if (typeof removeParts === 'string') return removeParts;
	const addPeople = validatePeopleList(input, 'addPeople');
	if (typeof addPeople === 'string') return addPeople;
	const removePeople = validatePeopleList(input, 'removePeople');
	if (typeof removePeople === 'string') return removePeople;
	const change = { chatbotId, purpose: purpose.purpose, addParts, removeParts, addPeople, removePeople };
	return refusalOfChange(change) ?? change;
}

function refusalOfChange(change: BusinessBrainChatbotChange): string | null {
	const { purpose, addParts, removeParts, addPeople, removePeople } = change;
	const changeCount = addParts.length + removeParts.length + addPeople.length + removePeople.length;
	const isPurposeGiven = purpose !== null;
	if (changeCount === 0 && !isPurposeGiven) return nothingToChange;
	const bothWays = [...addParts.filter((part) => removeParts.includes(part)), ...addPeople.filter((email) => removePeople.includes(email))];
	if (bothWays.length === 0) return null;
	return `"${bothWays[0]}" is both added and taken away; name it once. Nothing was changed.`;
}

function validatePurposeChange(input: Record<string, unknown>): { purpose: string | null; refusal: string | null } {
	const isPurposeLeftOut = input.purpose === undefined || input.purpose === null;
	if (isPurposeLeftOut) return { purpose: null, refusal: null };
	const purpose = trimmedText(input.purpose);
	return { purpose, refusal: lengthRefusal('purpose', purpose, longestPurpose, false) };
}
