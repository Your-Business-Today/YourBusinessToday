import { describe, expect, it, vi } from 'vitest';
import { placesFileOf } from './placesParquet.fixture';

const surbiton = { west: -0.38, east: -0.24, south: 51.34, north: 51.43 };
const inSurbiton = { longitude: -0.3045, latitude: 51.3925 };
const inParis = { longitude: 2.35, latitude: 48.85 };
const twoToAGroup = 2;

const filesByAddress: Record<string, ArrayBuffer> = {
	'places-1': placesFileOf(
		[
			{ id: 'lamb', ...inSurbiton },
			{ id: 'closed-cafe', ...inSurbiton, status: 'permanently_closed' },
			{ id: 'nameless', ...inSurbiton, name: null },
			{ id: 'paris-bistro', ...inParis }
		],
		twoToAGroup
	),
	'places-2': placesFileOf([{ id: 'antelope', ...inSurbiton, name: 'The Antelope' }], twoToAGroup),
	'removed-1': placesFileOf(
		[
			{ id: 'taken-out', ...inSurbiton },
			{ id: 'taken-out-in-paris', ...inParis }
		],
		twoToAGroup
	)
};

const fileListed = (address: string) => ({ url: address, byteLength: filesByAddress[address].byteLength });

vi.mock('hyparquet', async (importOriginal) => ({
	...(await importOriginal<typeof import('hyparquet')>()),
	asyncBufferFromUrl: async ({ url }: { url: string }) => filesByAddress[url]
}));
vi.mock('./overtureReleases', () => ({
	listPlaceFiles: async () => [fileListed('places-1'), fileListed('places-2')],
	listRemovedPlaceFiles: async () => [fileListed('removed-1')]
}));

const { readPlacesInRelease } = await import('./readPlacesInRelease');

describe('the places of one release in a box', () => {
	it('are the ones trading there, read from every file of the release', async () => {
		const reading = await readPlacesInRelease('2026-10-21.0', surbiton);
		expect(reading.trading.map((place) => place.businessName)).toEqual(['The Lamb', 'The Antelope']);
		expect(reading.trading[0]).toMatchObject({ sourceId: 'lamb', postcode: 'KT6 5NF', phone: '+442083990000', website: 'https://thelamb.example/' });
	});

	it('count a place that trades but carries no name as one that could not be read', async () => {
		const reading = await readPlacesInRelease('2026-10-21.0', surbiton);
		expect(reading.unreadableCount).toBe(1);
	});

	it('have gone when the release says they closed for good or its changelog took them out, and only inside the box', async () => {
		const reading = await readPlacesInRelease('2026-10-21.0', surbiton);
		expect(reading.goneIds).toEqual(['closed-cafe', 'taken-out']);
	});
});
