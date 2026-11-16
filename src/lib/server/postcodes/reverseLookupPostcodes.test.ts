import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { reverseLookupPostcodes } from './reverseLookupPostcodes';

type Geolocation = { longitude: number; latitude: number; limit: number; wideSearch: boolean };

const asked: Geolocation[][] = [];
const lamb = { postcode: 'KT6 5NF', outcode: 'KT6', latitude: 51.3925, longitude: -0.3045 };
const pointAt = (index: number) => ({ latitude: 51 + index / 10_000, longitude: -0.3 });

/** A stand-in for postcodes.io that finds the Lamb near every point but the ones out at sea, east of the meridian. */
function answerOf(geolocations: Geolocation[]) {
	return { status: 200, result: geolocations.map((query) => ({ query, result: query.longitude > 0 ? null : [lamb] })) };
}

describe('the postcode nearest each of many points', () => {
	beforeEach(() => {
		asked.length = 0;
		vi.stubGlobal('fetch', async (_url: URL, init: RequestInit) => {
			const { geolocations } = JSON.parse(String(init.body)) as { geolocations: Geolocation[] };
			asked.push(geolocations);
			return new Response(JSON.stringify(answerOf(geolocations)));
		});
	});
	afterEach(() => vi.unstubAllGlobals());

	it('asks for the nearest one only, searched widely, and answers in the order of the points with null where none is near', async () => {
		const nearest = await reverseLookupPostcodes([pointAt(0), { latitude: 51.5, longitude: 1.9 }]);
		expect(nearest).toEqual([lamb, null]);
		expect(asked).toEqual([[{ ...pointAt(0), limit: 1, wideSearch: true }, { latitude: 51.5, longitude: 1.9, limit: 1, wideSearch: true }]]);
	});

	it('asks a hundred points a request, and keeps every answer in order', async () => {
		const points = Array.from({ length: 450 }, (_, index) => pointAt(index));
		const nearest = await reverseLookupPostcodes(points);
		expect(asked.map((request) => request.length)).toEqual([100, 100, 100, 100, 50]);
		expect(asked.flat().map(({ latitude }) => latitude)).toEqual(points.map(({ latitude }) => latitude));
		expect(nearest).toHaveLength(450);
	});

	it('asks nothing when there is no point to place', async () => {
		expect(await reverseLookupPostcodes([])).toEqual([]);
		expect(asked).toEqual([]);
	});

	it('fails rather than count a point as having no postcode near it when the answer leaves points out', async () => {
		vi.stubGlobal('fetch', async () => new Response(JSON.stringify({ status: 200, result: [] })));
		await expect(reverseLookupPostcodes([pointAt(0)])).rejects.toThrow('postcodes.io answered 0 of 1 points');
	});

	it('fails when postcodes.io refuses, so the load is not marked whole', async () => {
		vi.stubGlobal('fetch', async () => new Response('busy', { status: 503 }));
		await expect(reverseLookupPostcodes([pointAt(0)])).rejects.toThrow('postcodes.io answered with status 503');
	});
});
