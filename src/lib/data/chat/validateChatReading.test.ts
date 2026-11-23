import { describe, expect, it } from 'vitest';
import { validateChatReading } from './validateChatReading';
import { chatReadingLimits, chatReadingRefusals } from './chatReadingRules';
import { chatMessageLimits } from './chatMessageRules';

describe('validateChatReading', () => {
	it('reads what is unread, the usual number of messages, when nothing is asked', () => {
		expect(validateChatReading({})).toEqual({ since: 'unread', limit: chatReadingLimits.usualMessagesRead });
	});

	it('takes all or unread, and refuses anything else by name', () => {
		expect(validateChatReading({ since: 'all' })).toEqual({ since: 'all', limit: chatReadingLimits.usualMessagesRead });
		expect(validateChatReading({ since: 'yesterday' })).toBe(chatReadingRefusals.since);
	});

	it('reads at most what the room on the site shows, and refuses one more, never cutting it down', () => {
		expect(chatReadingLimits.mostMessagesRead).toBe(chatMessageLimits.latestMessagesShown);
		expect(validateChatReading({ limit: chatReadingLimits.mostMessagesRead })).toEqual({ since: 'unread', limit: chatReadingLimits.mostMessagesRead });
		expect(validateChatReading({ limit: chatReadingLimits.mostMessagesRead + 1 })).toBe(chatReadingRefusals.limit);
	});

	it('refuses a limit that is not a whole number of messages', () => {
		expect(validateChatReading({ limit: 0 })).toBe(chatReadingRefusals.limit);
		expect(validateChatReading({ limit: 2.5 })).toBe(chatReadingRefusals.limit);
		expect(validateChatReading({ limit: '20' })).toBe(chatReadingRefusals.limit);
	});

	it('names the limit in its refusal', () => {
		expect(chatReadingRefusals.limit).toContain(String(chatReadingLimits.mostMessagesRead));
	});
});
