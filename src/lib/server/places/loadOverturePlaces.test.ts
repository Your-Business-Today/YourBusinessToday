import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { asFirstLoad, batches, clock, fivePlaces, startPlacesLoadAfresh, surbiton } from './placesLoad.fixture';
import { patchBoundsOnGround } from '$lib/data/patchBounds';
import type { SupabaseClient } from '@supabase/supabase-js';

const newest = '2026-10-21.0';
const holdingNewest = '2026-10-21.0+by-point';
const centre = { latitude: 51.3925, longitude: -0.3045 };
const { located, readRelease, markedGone } = vi.hoisted(() => ({ located: new Map<string, unknown>(), readRelease: vi.fn(), markedGone: vi.fn() }));

vi.mock('./overtureReleases', () => ({ findNewestRelease: async () => '2026-10-21.0' }));
vi.mock('./readPlacesInRelease', () => ({ readPlacesInRelease: readRelease }));
vi.mock('./placesWriter', async () => ({ placesPerBatch: 2, upsertPlaceBatch: (await import('./placesLoad.fixture')).writeBatch, markPlacesGone: markedGone }));
vi.mock('$lib/server/postcodes/geocodePostcodes', () => ({ geocodePostcodes: async () => located }));
vi.mock('./placesByPoint', () => ({ nearestPostcodesOf: async () => new Map() }));

const { loadOverturePlacesForPatch } = await import('./loadOverturePlaces');
const supabase = {} as SupabaseClient;
const marks: [string, number][] = [];
const load = (resumeMarker: string) => loadOverturePlacesForPatch(supabase, surbiton, { resumeMarker, wasLastRunFinished: true }, async (marker, rowsWritten) => void marks.push([marker, rowsWritten]));

describe("loading a territory's trading places", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		startPlacesLoadAfresh();
		marks.length = 0;
		located.set('KT6 5PZ', centre);
		vi.spyOn(Date, 'now').mockImplementation(() => clock.now);
		readRelease.mockResolvedValue({ trading: fivePlaces, unreadableCount: 1, goneIds: ['closed-cafe'] });
		markedGone.mockResolvedValue(1);
	});
	afterEach(() => vi.restoreAllMocks());

	it('leaves alone a territory that already holds the newest release placed by point, reading and writing nothing', async () => {
		expect(await load(holdingNewest)).toEqual({ rowsWritten: 0, resumeMarker: holdingNewest, note: 'Already holds release 2026-10-21.0.', isFinished: true });
		expect(readRelease).not.toHaveBeenCalled();
		expect(batches).toEqual([]);
	});

	it("writes a first load from the box of the territory's circle, a batch at a time in the order of the ids, then marks what has gone and holds the release", async () => {
		const outcome = await load('');
		expect(readRelease).toHaveBeenCalledWith(newest, patchBoundsOnGround(centre, 3));
		expect(batches).toEqual([asFirstLoad('a', 'b'), asFirstLoad('c', 'd'), asFirstLoad('e')]);
		expect(markedGone).toHaveBeenCalledWith(supabase, ['closed-cafe'], expect.any(String));
		expect(outcome).toMatchObject({ rowsWritten: 5, resumeMarker: holdingNewest, isFinished: true });
		expect(outcome.note).toBe('Release 2026-10-21.0: 5 trading places held, 0 of them placed by the postcode nearest their point. Left out: 0 the rules refuse (unsure, share-alike or too long), 0 with no postcode listed or near their point, 0 outside its outcodes, 1 with no name or point. 1 marked gone.');
	});

	it('marks where it has got to before it reads and after every batch, so a run cut off carries on there', async () => {
		await load('');
		expect(marks).toEqual([['>2026-10-21.0:0', 0], ['>2026-10-21.0:2', 2], ['>2026-10-21.0:4', 4], ['>2026-10-21.0:5', 5]]);
	});

	it('loads a later release as a later load, still holding the one before until the new one is whole', async () => {
		const outcome = await load('2026-09-23.1+by-point');
		expect(batches.map((batch) => batch.isFirstLoad)).toEqual([false, false, false]);
		expect(marks[0]).toEqual(['2026-09-23.1+by-point>2026-10-21.0:0', 0]);
		expect(outcome.resumeMarker).toBe(holdingNewest);
	});

	it('stops when its time is up, saying how far it got, and marks nothing gone until the release is whole', async () => {
		clock.millisecondsPerBatch = 100_000;
		const outcome = await load('');
		expect(batches).toEqual([asFirstLoad('a', 'b')]);
		expect(markedGone).not.toHaveBeenCalled();
		expect(outcome).toEqual({ rowsWritten: 2, resumeMarker: '>2026-10-21.0:2', note: 'Release 2026-10-21.0: 2 of 5 trading places written so far.', isFinished: false });
	});

	it('writes one batch even when reading the release took all its time, so a load never stands still', async () => {
		readRelease.mockImplementation(async () => ((clock.now += 200_000), { trading: fivePlaces, unreadableCount: 0, goneIds: [] }));
		expect(await load('')).toMatchObject({ rowsWritten: 2, isFinished: false });
	});

	it('carries on where the last run stopped, writing only what is left, still as a first load', async () => {
		const outcome = await load('>2026-10-21.0:2');
		expect(batches).toEqual([asFirstLoad('c', 'd'), asFirstLoad('e')]);
		expect(outcome).toMatchObject({ rowsWritten: 3, resumeMarker: holdingNewest, isFinished: true });
	});

	it('finishes a load whose places were all written before it was cut off, by marking what has gone', async () => {
		expect(await load('>2026-10-21.0:5')).toMatchObject({ rowsWritten: 0, resumeMarker: holdingNewest, isFinished: true });
		expect(batches).toEqual([]);
		expect(markedGone).toHaveBeenCalledTimes(1);
	});

	it('starts the newest release from its first place when the one it was part way through is no longer the newest', async () => {
		await load('>2026-09-23.1:4');
		expect(batches).toEqual([asFirstLoad('a', 'b'), asFirstLoad('c', 'd'), asFirstLoad('e')]);
		expect(marks[0]).toEqual(['>2026-10-21.0:0', 0]);
	});

	it('says so, writing nothing, when the centre of the territory is not located', async () => {
		located.clear();
		await expect(load('')).rejects.toThrow('Surbiton: the centre postcode is not located');
		expect(batches).toEqual([]);
	});
});
