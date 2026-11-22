import { chatReadingLimits, chatReadingRefusals, chatReadingSpans, type ChatReadingAsked, type ChatReadingSince } from './chatReadingRules';

const spans: unknown[] = Object.values(chatReadingSpans);
const fewestMessagesRead = 1;

function sinceAsked(since: unknown): ChatReadingSince | null {
	if (since === undefined) return chatReadingSpans.unread;
	const isASpan = spans.includes(since);
	if (!isASpan) return null;
	return since as ChatReadingSince;
}

function limitAsked(limit: unknown): number | null {
	if (limit === undefined) return chatReadingLimits.usualMessagesRead;
	const isWholeNumber = Number.isInteger(limit);
	if (!isWholeNumber) return null;
	const count = limit as number;
	const isInRange = count >= fewestMessagesRead && count <= chatReadingLimits.mostMessagesRead;
	if (!isInRange) return null;
	return count;
}

/** What the reading spans and how many messages it gives at most, or the sentence naming what does not fit. */
export function validateChatReading(input: Record<string, unknown>): ChatReadingAsked | string {
	const since = sinceAsked(input.since);
	if (since === null) return chatReadingRefusals.since;
	const limit = limitAsked(input.limit);
	if (limit === null) return chatReadingRefusals.limit;
	return { since, limit };
}
