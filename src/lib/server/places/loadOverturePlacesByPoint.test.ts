import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asFirstLoad, batches, clock, fivePlaces, startPlacesLoadAfresh, surbiton } from './placesLoad.fixture';
import type { PlaceSeed } from '$lib/data/placeRules';
import type { SupabaseClient } from '@supabase/supabase-js';

const holdingNewest = '2026-10-21.0+by-point';
const listedNoPostcode = (sourceId: string): PlaceSeed => ({ ...fivePlaces[0], sourceId, postcode: '' });
const { nearestPostcodesOf } = vi.hoisted(() => ({ nearestPostcodesOf: vi.fn() }));

vi.mock('./overtureReleases', () => ({ findNewestRelease: async () => '2026-10-21.0' }));
vi.mock('./readPlacesInRelease', () => ({ readPlacesInRelease: async () => ({ trading: [...fivePlaces, listedNoPostcode('f'), listedNoPostcode('g')], unreadableCount: 0, goneIds: [] }) }));
vi.mock('./placesWriter', async () => ({ placesPerBatch: 3, upsertPlaceBatch: (await import('./placesLoad.fixture')).writeBatch, markPlacesGone: async () => 0 }));
vi.mock('$lib/server/postcodes/geocodePostcodes', () => ({ geocodePostcodes: async () => new Map([['KT6 5PZ', { latitude: 51.3925, longitude: -0.3045 }]]) }));
vi.mock('./placesByPoint', () => ({ nearestPostcodesOf }));

const { loadOverturePlacesForPatch } = await import('./loadOverturePlaces');
const marks: string[] = [];
const load = (resumeMarker: string) => loadOverturePlacesForPatch({} as SupabaseClient, surbiton, { resumeMarker, wasLastRunFinished: true }, async (marker) => void marks.push(marker));

describe('placing by their point the trading places that list no postcode', () => {
	beforeEach(() => {
		startPlacesLoadAfresh();
		marks.length = 0;
		nearestPostcodesOf.mockReset();
		nearestPostcodesOf.mockResolvedValue(new Map([['f', 'KT6 4QB']]));
		vi.spyOn(Date, 'now').mockImplementation(() => clock.now);
	});
	afterEach(() => vi.restoreAllMocks());

	it('asks the postcode nearest the point of only the places that list none, and holds the ones it finds one for in the territory', async () => {
		const outcome = await load('');
		expect(nearestPostcodesOf).toHaveBeenCalledWith([expect.objectContaining({ sourceId: 'f' }), expect.objectContaining({ sourceId: 'g' })]);
		expect(batches).toEqual([asFirstLoad('a', 'b', 'c'), asFirstLoad('d', 'e', 'f')]);
		expect(outcome.note).toContain('6 trading places held, 1 of them placed by the postcode nearest their point');
		expect(outcome.note).toContain('1 with no postcode listed or near their point');
	});

	it('loads again, as a first load so the feed hears nothing, a territory that holds the newest release from before, and ends holding it placed by point', async () => {
		const outcome = await load('2026-10-21.0');
		expect(batches.map((batch) => batch.isFirstLoad)).toEqual([true, true]);
		expect(marks[0]).toBe('2026-10-21.0>2026-10-21.0:0');
		expect(outcome).toMatchObject({ rowsWritten: 6, resumeMarker: holdingNewest, isFinished: true });
	});

	it('carries a top-up cut off part way on where it stopped, still as a first load', async () => {
		const outcome = await load('2026-10-21.0>2026-10-21.0:3');
		expect(batches).toEqual([asFirstLoad('d', 'e', 'f')]);
		expect(outcome.resumeMarker).toBe(holdingNewest);
	});

	it('loads a newer release over one held from before as a first load: that one release goes unannounced, the accepted cost of the top-up', async () => {
		await load('2026-09-23.1');
		expect(batches.map((batch) => batch.isFirstLoad)).toEqual([true, true]);
	});

	it('marks nothing whole when the nearest postcodes could not be asked, so the next run starts again', async () => {
		nearestPostcodesOf.mockRejectedValue(new Error('postcodes.io answered with status 503'));
		await expect(load('')).rejects.toThrow('postcodes.io answered with status 503');
		expect(batches).toEqual([]);
		expect(marks).toEqual(['>2026-10-21.0:0']);
	});
});
