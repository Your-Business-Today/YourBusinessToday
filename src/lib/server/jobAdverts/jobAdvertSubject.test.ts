import { describe, expect, it } from 'vitest';
import { companyNameNeeded, jobAdvertSubjectLimits, validateJobAdvertSubject } from './jobAdvertSubject';

const builder = { companyName: 'Thames Ditton Joinery Ltd', place: 'KT1 1EU' };

describe('validateJobAdvertSubject', () => {
	it('accepts a company with or without a place', () => {
		expect(validateJobAdvertSubject(builder)).toBeNull();
		expect(validateJobAdvertSubject({ ...builder, place: '' })).toBeNull();
	});

	it('refuses a missing name and anything longer than its limit', () => {
		const tooLong = 'a'.repeat(jobAdvertSubjectLimits.longestCompanyName + 1);
		expect(validateJobAdvertSubject({ ...builder, companyName: '' })).toBe(companyNameNeeded);
		expect(validateJobAdvertSubject({ ...builder, companyName: tooLong })).toContain('company name is longer');
		expect(validateJobAdvertSubject({ ...builder, place: tooLong })).toContain('place is longer');
	});
});
