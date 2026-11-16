import { describe, expect, it } from 'vitest';
import { placesListingNoPostcode, sortPlacesForPatch } from './placesForPatch';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { PlaceSeed } from '$lib/data/placeRules';

const noneNearby = new Map<string, string>();
const surbiton = { id: 'surbiton-id', name: 'Surbiton', outcodes: ['KT5', 'KT6'] } as unknown as Patch;

const placeOf = (facts: Partial<PlaceSeed>): PlaceSeed => ({
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
	sourceLicence: 'CDLA-Permissive-2.0',
	...facts
});

describe('the places a territory is to hold', () => {
	it('are the ones the rules accept whose postcode lies in one of its outcodes, in the order of their ids', () => {
		const sorted = sortPlacesForPatch([placeOf({ sourceId: 'c' }), placeOf({ sourceId: 'a', postcode: 'KT5 8AB' }), placeOf({ sourceId: 'b' })], surbiton, noneNearby);
		expect(sorted.toWrite.map((place) => place.sourceId)).toEqual(['a', 'b', 'c']);
		expect(sorted).toMatchObject({ refusedCount: 0, unplacedCount: 0, outsideCount: 0 });
	});

	it('leave out, and count, a place the dataset is unsure of and one under a share-alike licence', () => {
		const sorted = sortPlacesForPatch([placeOf({ sourceId: 'unsure', confidence: 0.4 }), placeOf({ sourceId: 'share-alike', sourceLicence: 'ODbL-1.0' }), placeOf({})], surbiton, noneNearby);
		expect(sorted.toWrite.map((place) => place.sourceId)).toEqual(['lamb']);
		expect(sorted.refusedCount).toBe(2);
	});

	it('leave out, and count apart, a place with no postcode listed or near its point: it would be written where nobody could read it', () => {
		const sorted = sortPlacesForPatch([placeOf({ sourceId: 'no-postcode', postcode: '' }), placeOf({})], surbiton, noneNearby);
		expect(sorted.toWrite).toHaveLength(1);
		expect(sorted).toMatchObject({ placedByPointCount: 0, refusedCount: 0, unplacedCount: 1, outsideCount: 0 });
	});

	it('place one that lists no postcode by the postcode nearest its point, keeping the listing as it was listed', () => {
		const nearest = new Map([['field', 'KT6 4QB'], ['far-field', 'KT10 9HZ']]);
		const sorted = sortPlacesForPatch([placeOf({ sourceId: 'field', postcode: '' }), placeOf({ sourceId: 'far-field', postcode: '' }), placeOf({})], surbiton, nearest);
		expect(sorted.toWrite.map(({ sourceId, postcode, groundPostcode }) => ({ sourceId, postcode, groundPostcode }))).toEqual([
			{ sourceId: 'field', postcode: '', groundPostcode: 'KT6 4QB' },
			{ sourceId: 'lamb', postcode: 'KT6 5NF', groundPostcode: 'KT6 5NF' }
		]);
		expect(sorted).toMatchObject({ placedByPointCount: 1, unplacedCount: 0, outsideCount: 1 });
	});

	it('name for placing by their point only the places the rules accept that list no postcode, each once', () => {
		const trading = [placeOf({ sourceId: 'field', postcode: '' }), placeOf({ sourceId: 'field', postcode: '' }), placeOf({ sourceId: 'unsure', postcode: '', confidence: 0.4 }), placeOf({})];
		expect(placesListingNoPostcode(trading).map((place) => place.sourceId)).toEqual(['field']);
	});

	it('leave out, and count apart, a place in the box whose postcode is in an outcode the territory does not cover', () => {
		const sorted = sortPlacesForPatch([placeOf({ sourceId: 'esher', postcode: 'KT10 9HZ' }), placeOf({ sourceId: 'kingston', postcode: 'KT1 1EU' }), placeOf({})], surbiton, noneNearby);
		expect(sorted.toWrite.map((place) => place.sourceId)).toEqual(['lamb']);
		expect(sorted.outsideCount).toBe(2);
	});

	it('hold a place once when the release lists its id twice, since a batch naming one place twice is refused whole', () => {
		const sorted = sortPlacesForPatch([placeOf({ businessName: 'The Lamb' }), placeOf({ businessName: 'The Lamb Inn' })], surbiton, noneNearby);
		expect(sorted.toWrite.map((place) => place.businessName)).toEqual(['The Lamb Inn']);
	});
});
