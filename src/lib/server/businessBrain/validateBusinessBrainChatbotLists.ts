import { businessBrainChatbotLimits } from '$lib/data/businessBrainChatbotRules';
import { businessBrainPartKinds, isBusinessBrainPartKind, type BusinessBrainPartKind } from '$lib/data/businessBrainRules';
import { isEmailShaped } from '$lib/data/emailShape';
import { trimmedText } from '$lib/data/trimmedText';

const { shortestEmail, longestEmail, mostPeopleAtOnce } = businessBrainChatbotLimits;

/** The texts of a list field, blank ones left out, or a sentence saying the field is not a list. */
export function readTextList(input: Record<string, unknown>, field: string): string[] | string {
	const value = input[field];
	if (value === undefined || value === null) return [];
	if (!Array.isArray(value)) return `The ${field} is a list, such as ["process", "people"]; leave it out for none.`;
	return value.map(trimmedText).filter((text) => text !== '');
}

/** The parts of the brain named in a list field, each once, or a sentence naming the one that is not a part. */
export function validatePartList(input: Record<string, unknown>, field: string): BusinessBrainPartKind[] | string {
	const texts = readTextList(input, field);
	if (typeof texts === 'string') return texts;
	const notAPart = texts.find((text) => !isBusinessBrainPartKind(text));
	if (notAPart !== undefined) return `"${notAPart}" in ${field} is not a part of the brain; the parts are ${businessBrainPartKinds.join(', ')}.`;
	return [...new Set(texts as BusinessBrainPartKind[])];
}

function emailRefusal(field: string, email: string): string | null {
	const fitsColumn = email.length >= shortestEmail && email.length <= longestEmail;
	if (fitsColumn && isEmailShaped(email)) return null;
	return `"${email}" in ${field} is not an email address of at most ${longestEmail} characters, such as nigel@example.com.`;
}

/** The people named in a list field by email, in lower case and each once, or a sentence naming what does not fit. */
export function validatePeopleList(input: Record<string, unknown>, field: string): string[] | string {
	const texts = readTextList(input, field);
	if (typeof texts === 'string') return texts;
	const emails = [...new Set(texts.map((text) => text.toLowerCase()))];
	if (emails.length > mostPeopleAtOnce) return `The ${field} names at most ${mostPeopleAtOnce} people at once; this one names ${emails.length}.`;
	const refusals = emails.map((email) => emailRefusal(field, email));
	const firstRefusal = refusals.find((refusal) => refusal !== null);
	return firstRefusal ?? emails;
}
