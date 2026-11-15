import { describe, expect, it } from 'vitest';
import { businessTypeNameOf, businessTypes, describeChosenTypes, readBusinessTypes, sicCodesOfTypes } from './businessTypes';
import { isSicCode } from './sicCodes';

describe('the types of business a map is narrowed to', () => {
	it('names every type by a five-digit SIC code under a key of its own', () => {
		const keys = businessTypes.map((type) => type.key);
		expect(new Set(keys).size).toBe(keys.length);
		expect(businessTypes.flatMap((type) => type.sicCodes).every(isSicCode)).toBe(true);
	});

	it('reads the chosen types and leaves out a key it does not hold', () => {
		expect(readBusinessTypes(['electricians', 'nonsense']).map((type) => type.name)).toEqual(['Electricians']);
	});

	it('gathers the codes of the chosen types once each', () => {
		const chosen = readBusinessTypes(['electricians', 'plumbers']);
		expect(sicCodesOfTypes(chosen)).toEqual(['43210', '43220']);
	});

	it('gives a company the plain name of its type, or nothing for a code no type holds', () => {
		expect(businessTypeNameOf(['99999', '43210'])).toBe('Electricians');
		expect(businessTypeNameOf(['99999'])).toBe('');
	});

	it('says any, the one chosen, or how many are chosen', () => {
		expect(describeChosenTypes([])).toBe('Any type of business');
		expect(describeChosenTypes(['electricians'])).toBe('Electricians');
		expect(describeChosenTypes(['electricians', 'plumbers'])).toBe('2 types chosen');
	});
});
