import { describe, expect, it } from 'vitest';
import { isPersonLedTitle } from './personLedTitle';

const people = [{ name: 'Jeremy Ferendinos', email: 'jeremy@example.com' }];

describe('a title led by a person’s name', () => {
	it('is one that opens with a project person’s first name and a colon', () => {
		expect(isPersonLedTitle('Jeremy: call Hiscox about the quote', people)).toBe(true);
		expect(isPersonLedTitle('jeremy : call Hiscox', people)).toBe(true);
	});

	it('is not a fix, a story, or another name', () => {
		expect(isPersonLedTitle('FIX: the export button does nothing', people)).toBe(false);
		expect(isPersonLedTitle('Call Hiscox about the quote', people)).toBe(false);
		expect(isPersonLedTitle('Nigel: confirm the split', people)).toBe(false);
	});
});
