import { describe, expect, it } from 'vitest';
import { prospectNeedsNameAndNumber, validateProspect } from './prospectRules';

const jewel = { name: 'Jewel Bespoke Build Ltd', companyNumber: '13752749', address: 'Argent House', postcode: 'KT6 7LD' };

describe('validateProspect', () => {
	it('accepts a Companies House company with an eight-character number, whatever its registered office postcode', () => {
		expect(validateProspect(jewel)).toBeNull();
		expect(validateProspect({ ...jewel, companyNumber: 'SC123456', postcode: undefined })).toBeNull();
		expect(validateProspect({ ...jewel, postcode: 'Overseas' })).toBeNull();
	});

	it('refuses a missing name or number and a number of the wrong shape', () => {
		expect(validateProspect({ ...jewel, name: '' })).toBe(prospectNeedsNameAndNumber);
		expect(validateProspect({ ...jewel, companyNumber: '' })).toBe(prospectNeedsNameAndNumber);
		expect(validateProspect({ ...jewel, companyNumber: '1375' })).toContain('is not a company number');
	});
});
