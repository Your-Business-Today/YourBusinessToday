import { businessBrainChatbotLimits } from '$lib/data/businessBrainChatbotRules';
import { validateIsoDate } from '$lib/data/books/isoDate';
import { trimmedText } from '$lib/data/trimmedText';
import { validateRecordId } from '$lib/data/isUuid';
import type { ChatbotTrailFilters } from '$lib/data/businessBrainChatbotTrailRules';

const { longestEmail } = businessBrainChatbotLimits;

const personRefusal = `The person is the email they sign in to Your Business Today with, at most ${longestEmail} characters.`;
const daysInOrderRefusal = 'The fromDay comes on or before the toDay.';

/** Which questions to list, each filter left out for all of them, or a sentence naming the filter that does not fit. */
export function validateChatbotTrailFilters(input: Record<string, unknown>): ChatbotTrailFilters | string {
	const chatbotId = optionalText(input.chatbotId);
	const chatbotRefusal = chatbotId === null ? null : validateRecordId('chatbotId', chatbotId);
	if (chatbotRefusal !== null) return chatbotRefusal;
	const email = optionalText(input.person)?.toLowerCase() ?? null;
	const isPersonTooLong = email !== null && email.length > longestEmail;
	if (isPersonTooLong) return personRefusal;
	const days = validateDays(optionalText(input.fromDay), optionalText(input.toDay));
	if (typeof days === 'string') return days;
	return { chatbotId, email, ...days };
}

function validateDays(fromDay: string | null, toDay: string | null): Pick<ChatbotTrailFilters, 'fromDay' | 'toDay'> | string {
	const fromRefusal = fromDay === null ? null : validateIsoDate('The fromDay', fromDay);
	if (fromRefusal !== null) return fromRefusal;
	const toRefusal = toDay === null ? null : validateIsoDate('The toDay', toDay);
	if (toRefusal !== null) return toRefusal;
	const isOutOfOrder = fromDay !== null && toDay !== null && fromDay > toDay;
	if (isOutOfOrder) return daysInOrderRefusal;
	return { fromDay, toDay };
}

function optionalText(value: unknown): string | null {
	const text = trimmedText(value);
	if (text === '') return null;
	return text;
}
