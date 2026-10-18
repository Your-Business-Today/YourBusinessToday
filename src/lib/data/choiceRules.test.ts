import { describe, expect, it } from 'vitest';
import { validateChoice } from './choiceRules';
import { validateHeadcountBand } from './headcountBands';
import { validateSeniority, validateWarmth } from './contactProfileFields';

describe('validateChoice', () => {
	it('lets a left-out value or one of the choices through', () => {
		expect(validateChoice('colour', null, ['', 'red'])).toBeNull();
		expect(validateChoice('colour', '', ['', 'red'])).toBeNull();
		expect(validateChoice('colour', 'red', ['', 'red'])).toBeNull();
	});

	it('refuses anything else by name, listing the choices without the blank', () => {
		expect(validateChoice('colour', 'blue', ['', 'red', 'green'])).toBe('The colour is one of red, green.');
	});
});

describe('the profile choices', () => {
	it('refuses an unknown headcount band, seniority or warmth rather than blanking it', () => {
		expect(validateHeadcountBand('11-50')).toBeNull();
		expect(validateHeadcountBand('lots')).toBe('The headcount band is one of 1-10, 11-50, 51-200, 201-500, 500+.');
		expect(validateSeniority('director')).toBeNull();
		expect(validateSeniority('boss')).toBe('The seniority is one of junior, manager, director, executive, owner.');
		expect(validateWarmth('hot')).toBeNull();
		expect(validateWarmth('tepid')).toBe('The warmth is one of cold, warm, hot.');
	});
});
