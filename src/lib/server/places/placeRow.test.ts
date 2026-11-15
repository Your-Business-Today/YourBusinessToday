import { describe, expect, it } from 'vitest';
import { isClosedForGood, isPlaceIn, placeSeedOf, strictestLicenceOf } from './placeRow';
import { overturePlaceOf } from './placesParquet.fixture';
import { validatePlace } from '$lib/data/placeRules';

const surbiton = { west: -0.38, east: -0.24, south: 51.34, north: 51.43 };
const lamb = overturePlaceOf({ id: 'lamb', longitude: -0.3045, latitude: 51.3925 });

describe('a place as a release holds it', () => {
	it('becomes a seed with its name, category, first address, website and phone, and its postcode as the Royal Mail writes it', () => {
		const place = { ...lamb, addresses: [{ freeform: ' 73 Brighton Road ', postcode: 'kt65nf' }, { freeform: 'Another', postcode: 'KT1 1AA' }], websites: ['https://thelamb.example/', 'https://second.example/'] };
		expect(placeSeedOf(place)).toEqual({
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
		});
	});

	it('is no seed without its id, its name or its point', () => {
		expect(placeSeedOf({ ...lamb, id: null })).toBeNull();
		expect(placeSeedOf({ ...lamb, names: { primary: '  ' } })).toBeNull();
		expect(placeSeedOf({ ...lamb, bbox: null })).toBeNull();
		expect(placeSeedOf({ ...lamb, bbox: { xmin: Number.NaN, ymin: 51.39 } })).toBeNull();
	});

	it('is a seed with empty values where the release lists no address, website, phone or category', () => {
		const bare = placeSeedOf({ ...lamb, addresses: null, websites: [], phones: null, taxonomy: null, confidence: null, sources: null });
		expect(bare).toMatchObject({ address: '', postcode: '', website: '', phone: '', category: '', confidence: 0, sourceLicence: '' });
	});

	it('is judged by a share-alike licence among its sources even when a permissive one is listed first, so it is refused', () => {
		const mixed = overturePlaceOf({ id: 'mixed', longitude: -0.3, latitude: 51.39, licences: ['CDLA-Permissive-2.0', 'ODbL-1.0', 'Apache-2.0'] });
		const seed = placeSeedOf(mixed);
		expect(seed?.sourceLicence).toBe('ODbL-1.0');
		expect(seed === null ? null : validatePlace(seed)).toContain('share-alike');
	});

	it('is judged by the first licence listed when every source may be held', () => {
		expect(strictestLicenceOf([{ license: 'Apache-2.0' }, { license: 'CDLA-Permissive-2.0' }])).toBe('Apache-2.0');
		expect(strictestLicenceOf([null, { license: null }])).toBe('');
		expect(strictestLicenceOf([])).toBe('');
	});

	it('has closed for good only when the release says exactly that', () => {
		expect(isClosedForGood({ ...lamb, operating_status: 'permanently_closed' })).toBe(true);
		expect(isClosedForGood({ ...lamb, operating_status: 'temporarily_closed' })).toBe(false);
		expect(isClosedForGood(lamb)).toBe(false);
	});

	it('lies in a box when its point does, edges included, and never when it has no point', () => {
		expect(isPlaceIn(lamb, surbiton)).toBe(true);
		expect(isPlaceIn({ ...lamb, bbox: { xmin: surbiton.west, ymin: surbiton.north } }, surbiton)).toBe(true);
		expect(isPlaceIn({ ...lamb, bbox: { xmin: -0.5, ymin: 51.39 } }, surbiton)).toBe(false);
		expect(isPlaceIn({ ...lamb, bbox: { xmin: -0.3, ymin: 51.5 } }, surbiton)).toBe(false);
		expect(isPlaceIn({ ...lamb, bbox: null }, surbiton)).toBe(false);
	});
});
