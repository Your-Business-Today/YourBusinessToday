import { describe, expect, it } from 'vitest';
import { validatePlace, type PlaceSeed } from './placeRules';

const lamb: PlaceSeed = {
	sourceId: 'lamb',
	businessName: 'The Lamb',
	category: 'pub',
	address: '73 Brighton Road',
	postcode: 'KT6 5NF',
	latitude: 51.3925,
	longitude: -0.3045,
	website: 'https://thelamb.example/',
	phone: '+442083990000',
	confidence: 0.95,
	sourceLicence: 'CDLA-Permissive-2.0'
};

const refusalOf = (facts: Partial<PlaceSeed>) => validatePlace({ ...lamb, ...facts });

describe('what a trading place must be before it is written', () => {
	it('is written as it stands when every value fits its column and its licence lets us hold it', () => {
		expect(validatePlace(lamb)).toBeNull();
		expect(refusalOf({ sourceLicence: '', website: '', phone: '', category: '', address: '' })).toBeNull();
	});

	it('needs its id and its name', () => {
		expect(refusalOf({ sourceId: '' })).toBe('A place needs its id and name.');
		expect(refusalOf({ businessName: '' })).toBe('A place needs its id and name.');
	});

	it('is refused by name of the value that is longer than its column, never cut to fit', () => {
		expect(refusalOf({ businessName: 'n'.repeat(201) })).toBe('lamb: the name is over 200 characters.');
		expect(refusalOf({ category: 'c'.repeat(101) })).toBe('lamb: the category is over 100 characters.');
		expect(refusalOf({ address: 'a'.repeat(301) })).toBe('lamb: the address is over 300 characters.');
		expect(refusalOf({ website: 'w'.repeat(301) })).toBe('lamb: the website is over 300 characters.');
		expect(refusalOf({ phone: '1'.repeat(41) })).toBe('lamb: the phone is over 40 characters.');
		expect(refusalOf({ sourceLicence: 'l'.repeat(121) })).toBe('lamb: the licence name is over 120 characters.');
	});

	it('is refused when the dataset is less sure of it than the floor, or surer than a confidence can be', () => {
		expect(refusalOf({ confidence: 0.69 })).toBe('lamb: confidence 0.69 is below 0.7.');
		expect(refusalOf({ confidence: 0.7 })).toBeNull();
		expect(refusalOf({ confidence: 1 })).toBeNull();
		expect(refusalOf({ confidence: 1.2 })).toBe('lamb: confidence 1.2 is above 1.');
	});

	it('is refused under a share-alike licence, which would bind this database, and kept under a permissive one', () => {
		expect(refusalOf({ sourceLicence: 'ODbL-1.0' })).toBe('lamb is under a share-alike licence and is not stored.');
		expect(refusalOf({ sourceLicence: 'Apache-2.0' })).toBeNull();
		expect(refusalOf({ sourceLicence: 'CC0-1.0' })).toBeNull();
	});
});
