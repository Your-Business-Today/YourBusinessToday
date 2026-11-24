import { describe, expect, it } from 'vitest';
import { coverageRefusal, validateChatSummary } from './validateChatSummary';
import { chatSummaryLimits, chatSummaryRefusals } from './chatSummaryRules';

const latestMessageAt = '2026-11-22T09:30:00.123456+00:00';
const now = Date.parse('2026-11-22T12:00:00Z');

describe('validateChatSummary', () => {
	it('takes the words trimmed and the moment exactly as given', () => {
		expect(validateChatSummary({ words: '  Nigel paid the VAT. ', coversUpTo: latestMessageAt })).toEqual({ words: 'Nigel paid the VAT.', coversUpTo: latestMessageAt });
		expect(validateChatSummary({ words: 'Done.', coversUpTo: '2026-11-22T09:30:00Z' })).toEqual({ words: 'Done.', coversUpTo: '2026-11-22T09:30:00Z' });
	});

	it('refuses words that are blank, too long or not text, never cutting them to fit', () => {
		expect(validateChatSummary({ words: '   ', coversUpTo: latestMessageAt })).toBe(chatSummaryRefusals.words);
		expect(validateChatSummary({ words: 'a'.repeat(chatSummaryLimits.longestWords + 1), coversUpTo: latestMessageAt })).toBe(chatSummaryRefusals.words);
		expect(validateChatSummary({ words: 7, coversUpTo: latestMessageAt })).toBe(chatSummaryRefusals.words);
		expect(validateChatSummary({ words: 'a'.repeat(chatSummaryLimits.longestWords), coversUpTo: latestMessageAt })).not.toBeTypeOf('string');
	});

	it('refuses a moment with no offset, no time, a time that is no time, or one left out', () => {
		for (const coversUpTo of ['2026-11-22', '2026-11-22T09:30:00', '2026-13-45T99:30:00Z', 'yesterday', undefined, 1700000000]) {
			expect(validateChatSummary({ words: 'Done.', coversUpTo })).toBe(chatSummaryRefusals.coversUpTo);
		}
	});
});

describe('coverageRefusal', () => {
	it('lets a catch-up cover up to the latest message, or any moment before it', () => {
		expect(coverageRefusal(latestMessageAt, latestMessageAt, now)).toBeNull();
		expect(coverageRefusal('2026-11-21T09:00:00Z', latestMessageAt, now)).toBeNull();
	});

	it('refuses a moment in the future, one after the latest message, and a room where nothing has been said', () => {
		expect(coverageRefusal('2026-11-23T09:00:00Z', latestMessageAt, now)).toBe(chatSummaryRefusals.coversTheFuture);
		expect(coverageRefusal('2026-11-22T10:00:00Z', latestMessageAt, now)).toBe(chatSummaryRefusals.coversPastTheLatest);
		expect(coverageRefusal(latestMessageAt, null, now)).toBe(chatSummaryRefusals.nothingSaid);
	});
});
