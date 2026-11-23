import { chatSummaryLimits, chatSummaryRefusals, momentWithOffset, type ChatSummaryGiven } from './chatSummaryRules';

const refusals = chatSummaryRefusals;
const fewestCharacters = 1;

function wordsOf(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const words = value.trim();
	const isFitting = words.length >= fewestCharacters && words.length <= chatSummaryLimits.longestWords;
	if (!isFitting) return null;
	return words;
}

function momentOf(value: unknown): string | null {
	if (typeof value !== 'string') return null;
	const isMoment = momentWithOffset.test(value) && !Number.isNaN(Date.parse(value));
	if (!isMoment) return null;
	return value;
}

/** The catch-up's words and the moment it covers up to, or the sentence naming what does not fit. */
export function validateChatSummary(input: Record<string, unknown>): ChatSummaryGiven | string {
	const words = wordsOf(input.words);
	if (words === null) return refusals.words;
	const coversUpTo = momentOf(input.coversUpTo);
	if (coversUpTo === null) return refusals.coversUpTo;
	return { words, coversUpTo };
}

/**
 * Why the catch-up cannot cover up to that moment, or null when it can: something has been said in the room, and the
 * moment is neither in the future nor later than the room's latest message.
 */
export function coverageRefusal(coversUpTo: string, latestMessageAt: string | null, now: number): string | null {
	if (latestMessageAt === null) return refusals.nothingSaid;
	const covered = Date.parse(coversUpTo);
	if (covered > now) return refusals.coversTheFuture;
	if (covered > Date.parse(latestMessageAt)) return refusals.coversPastTheLatest;
	return null;
}
