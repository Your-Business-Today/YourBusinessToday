import { describe, expect, it } from 'vitest';
import { validateChatMessage } from './validateChatMessage';
import { chatMessageLimits, chatMessageRefusals } from './chatMessageRules';
import { chatFileLimits, chatFileRefusals } from './chatFileRules';

const sitePhoto = { storagePath: 'jewel/nigel/upload/site.jpg', fileName: 'site.jpg' };

describe('validateChatMessage', () => {
	it('takes the words as given, without the space around them, and no files', () => {
		expect(validateChatMessage({ body: '  Morning, all.\n' })).toEqual({ body: 'Morning, all.', files: [] });
	});

	it('refuses a message with neither words nor files by name', () => {
		expect(validateChatMessage({ body: '   ' })).toBe(chatFileRefusals.wordsOrFiles);
		expect(validateChatMessage({})).toBe(chatFileRefusals.wordsOrFiles);
		expect(validateChatMessage({ body: '', files: '[]' })).toBe(chatFileRefusals.wordsOrFiles);
	});

	it('takes files with no words, given as a list or as the list the form carries as text', () => {
		expect(validateChatMessage({ files: [sitePhoto] })).toEqual({ body: '', files: [sitePhoto] });
		expect(validateChatMessage({ body: 'The slab', files: JSON.stringify([sitePhoto]) })).toEqual({ body: 'The slab', files: [sitePhoto] });
	});

	it('refuses words that are not text, never reading a number or a list as words', () => {
		expect(validateChatMessage({ body: 42 })).toBe(chatMessageRefusals.body);
		expect(validateChatMessage({ body: ['Morning'] })).toBe(chatMessageRefusals.body);
	});

	it('takes the longest words the column holds and refuses one character more, never shortening them', () => {
		const longest = 'a'.repeat(chatMessageLimits.longestBody);
		expect(validateChatMessage({ body: longest })).toEqual({ body: longest, files: [] });
		expect(validateChatMessage({ body: `${longest}a` })).toBe(chatMessageRefusals.body);
		expect(chatMessageRefusals.body).toContain(String(chatMessageLimits.longestBody));
	});

	it('takes as many files as a message carries and refuses one more', () => {
		const most = Array.from({ length: chatFileLimits.mostFilesOnAMessage }, () => sitePhoto);
		expect(validateChatMessage({ files: most })).toEqual({ body: '', files: most });
		expect(validateChatMessage({ files: [...most, sitePhoto] })).toBe(chatFileRefusals.tooManyFiles);
		expect(chatFileRefusals.tooManyFiles).toContain(String(chatFileLimits.mostFilesOnAMessage));
	});

	it('refuses files that are not a list of named files', () => {
		expect(validateChatMessage({ body: 'Hi', files: 'not a list' })).toBe(chatFileRefusals.filesNotAList);
		expect(validateChatMessage({ body: 'Hi', files: { storagePath: 'a' } })).toBe(chatFileRefusals.filesNotAList);
		expect(validateChatMessage({ body: 'Hi', files: [{ storagePath: 'a' }] })).toBe(chatFileRefusals.filesNotAList);
	});
});
