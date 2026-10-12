import { describe, expect, it } from 'vitest';
import {
	longestPatchName,
	patchNeedsName,
	patchNeedsPostcode,
	patchRadiusRefusal,
	readPatchSeed,
	validatePatch
} from './patchRules';

const kingston = { name: 'Kingston', centrePostcode: 'kt1 1eu', radiusMiles: '3', sicCodes: '41100, 43390' };

describe('readPatchSeed', () => {
	it('normalises the postcode, reads the radius as a number and splits the codes', () => {
		expect(readPatchSeed(kingston)).toEqual({
			name: 'Kingston',
			centrePostcode: 'KT1 1EU',
			radiusMiles: 3,
			sicCodes: ['41100', '43390']
		});
	});
});

describe('validatePatch', () => {
	it('accepts a patch whose every value fits its column', () => {
		expect(validatePatch(readPatchSeed(kingston))).toBeNull();
	});

	it('refuses a missing name, a name past the column and a postcode the Royal Mail would not know', () => {
		expect(validatePatch(readPatchSeed({ ...kingston, name: ' ' }))).toBe(patchNeedsName);
		const tooLong = 'K'.repeat(longestPatchName + 1);
		expect(validatePatch(readPatchSeed({ ...kingston, name: tooLong }))).toContain(String(longestPatchName));
		expect(validatePatch(readPatchSeed({ ...kingston, centrePostcode: 'nowhere' }))).toBe(patchNeedsPostcode);
	});

	it('refuses a radius off the map and a code that is not five digits, rather than repairing them', () => {
		expect(validatePatch(readPatchSeed({ ...kingston, radiusMiles: '4' }))).toBe(patchRadiusRefusal);
		expect(validatePatch(readPatchSeed({ ...kingston, radiusMiles: '' }))).toBe(patchRadiusRefusal);
		expect(validatePatch(readPatchSeed({ ...kingston, sicCodes: '411' }))).toContain('411 is not a SIC code');
	});
});
