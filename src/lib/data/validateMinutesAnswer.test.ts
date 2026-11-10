import { describe, expect, it } from 'vitest';
import { validateMinutesAnswer } from './validateMinutesAnswer';
import { validateMinutesWords } from './validateMinutesWords';
import { validateMeetingClose } from './validateMeetingClose';
import { boardMinutesLimits, boardMinutesRefusals } from './boardroomMinutesRules';

describe('the minutes’ inputs are checked against their columns and refused, never repaired', () => {
	it('takes an approval with no words, and a change only with its words', () => {
		expect(validateMinutesAnswer({ version: 1, answer: 'approves' })).toEqual({ version: 1, answer: 'approves', changeWords: null });
		expect(validateMinutesAnswer({ version: 2, answer: 'asks_for_change', changeWords: ' Add the date. ' })).toEqual({
			version: 2,
			answer: 'asks_for_change',
			changeWords: 'Add the date.'
		});
		expect(validateMinutesAnswer({ version: 2, answer: 'asks_for_change' })).toBe(boardMinutesRefusals.changeWordsMissing);
		expect(validateMinutesAnswer({ version: 2, answer: 'approves', changeWords: 'But…' })).toBe(boardMinutesRefusals.changeWordsWithApproval);
	});

	it('refuses a version that is not a whole number from 1, an unknown answer, and words past the column', () => {
		expect(validateMinutesAnswer({ version: 0, answer: 'approves' })).toBe(boardMinutesRefusals.versionNotANumber);
		expect(validateMinutesAnswer({ version: 1, answer: 'agrees' })).toBe(boardMinutesRefusals.answerUnknown);
		const tooLong = 'x'.repeat(boardMinutesLimits.longestChangeWords + 1);
		expect(validateMinutesAnswer({ version: 1, answer: 'asks_for_change', changeWords: tooLong })).toBe(boardMinutesRefusals.changeWordsMissing);
	});

	it('refuses minutes with no words or more than the column holds', () => {
		expect(validateMinutesWords({ words: '  ' })).toBe(boardMinutesRefusals.wordsMissing);
		expect(validateMinutesWords({ words: 'x'.repeat(boardMinutesLimits.longestWords + 1) })).toBe(boardMinutesRefusals.wordsMissing);
		expect(validateMinutesWords({ words: ' The board met. ' })).toEqual({ words: 'The board met.' });
	});

	it('closes with items waiting only on a plain true', () => {
		expect(validateMeetingClose({})).toEqual({ isClosingWithItemsWaiting: false });
		expect(validateMeetingClose({ closeWithItemsWaiting: true })).toEqual({ isClosingWithItemsWaiting: true });
		expect(validateMeetingClose({ closeWithItemsWaiting: 'yes' })).toBe(boardMinutesRefusals.confirmNotAnAnswer);
	});
});
