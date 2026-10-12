import { describe, expect, it } from 'vitest';
import { prospectNeedsNameAndNumber, validateProspect } from './prospectRules';

const jewel = { name: 'Jewel Bespoke Build Ltd', companyNumber: '13752749', address: 'Argent House', postcode: 'KT6 7LD' };

describe('validateProspect', () => {
	it('accepts a Companies House company with an eight-character number and a postcode', () => {
		expect(validateProspect(jewel)).toBeNull();
		expect(validateProspect({ ...jewel, companyNumber: 'SC123456', postcode: undefined })).toBeNull();
	});

	it('refuses a missing name or number, a number of the wrong shape, and a postcode that is not one', () => {
		expect(validateProspect({ ...jewel, name: '' })).toBe(prospectNeedsNameAndNumber);
		expect(validateProspect({ ...jewel, companyNumber: '' })).toBe(prospectNeedsNameAndNumber);
		expect(validateProspect({ ...jewel, companyNumber: '1375' })).toContain('is not a company number');
		expect(validateProspect({ ...jewel, postcode: 'nowhere' })).toContain('does not read as a postcode');
	});
});
