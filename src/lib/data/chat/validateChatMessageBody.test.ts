import { describe, expect, it } from 'vitest';
import { validateChatMessageBody } from './validateChatMessageBody';
import { chatMessageLimits, chatMessageRefusals } from './chatMessageRules';

describe('validateChatMessageBody', () => {
	it('takes the words as given, without the space around them', () => {
		expect(validateChatMessageBody({ body: '  Morning, all.\n' })).toEqual({ body: 'Morning, all.' });
	});

	it('refuses blank words by name', () => {
		expect(validateChatMessageBody({ body: '   ' })).toBe(chatMessageRefusals.body);
		expect(validateChatMessageBody({})).toBe(chatMessageRefusals.body);
	});

	it('refuses words that are not text, never reading a number or a list as words', () => {
		expect(validateChatMessageBody({ body: 42 })).toBe(chatMessageRefusals.body);
		expect(validateChatMessageBody({ body: ['Morning'] })).toBe(chatMessageRefusals.body);
	});

	it('takes the longest message the column holds and refuses one character more, never shortening it', () => {
		const longest = 'a'.repeat(chatMessageLimits.longestBody);
		expect(validateChatMessageBody({ body: longest })).toEqual({ body: longest });
		expect(validateChatMessageBody({ body: `${longest}a` })).toBe(chatMessageRefusals.body);
	});

	it('names the limit in its refusal', () => {
		expect(chatMessageRefusals.body).toContain(String(chatMessageLimits.longestBody));
	});
});
