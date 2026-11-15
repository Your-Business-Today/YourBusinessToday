import { describe, expect, it } from 'vitest';
import { premisesAddressLine } from './premisesAddressLine';

describe('where a premises stands, as one line', () => {
	it('is its address and its postcode', () => {
		expect(premisesAddressLine({ address: '73 Brighton Road, Surbiton', postcode: 'KT6 5NF', sector: 'KT6 5' })).toBe('73 Brighton Road, Surbiton, KT6 5NF');
	});

	it('is the postcode alone when the register gives no address', () => {
		expect(premisesAddressLine({ address: '', postcode: 'KT6 5NF', sector: 'KT6 5' })).toBe('KT6 5NF');
	});

	it('is the sector when the register gives neither', () => {
		expect(premisesAddressLine({ address: '', postcode: '', sector: 'KT6 5' })).toBe('KT6 5');
	});
});
