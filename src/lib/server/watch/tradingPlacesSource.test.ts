import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { WatchRun } from './watchRunRecord';

const newestRelease = '2026-10-21.0';
const releaseBefore = '2026-09-23.1';
const holdingNewest = '2026-10-21.0+by-point';
const { loaded } = vi.hoisted(() => ({ loaded: vi.fn() }));
let territories: Patch[] = [];
let lastLoads: Record<string, WatchRun> = {};

vi.mock('$lib/server/places/overtureReleases', () => ({ findNewestRelease: async () => newestRelease }));
vi.mock('$lib/server/places/loadOverturePlaces', () => ({ loadOverturePlacesForPatch: vi.fn() }));
vi.mock('$lib/server/patches/listPatches', () => ({ listPatches: async () => territories }));
vi.mock('./watchRunLog', () => ({ readLatestRun: async (_supabase: unknown, source: string) => lastLoads[source] ?? null }));
vi.mock('./runWatchSource', () => ({ runWatchSource: loaded }));

const { tradingPlacesSource } = await import('./tradingPlacesSource');
const supabase = {} as SupabaseClient;
const aFreshStart = { resumeMarker: '', wasLastRunFinished: true };
const noProgress = async () => {};

const territoryOf = (id: string, name: string) => ({ id, name, outcodes: ['KT6'] }) as unknown as Patch;
const surbiton = territoryOf('surbiton-id', 'Surbiton');
const sutton = territoryOf('sutton-id', 'Sutton');
const woking = territoryOf('woking-id', 'Woking');

function loadOf(territory: Patch, startedAt: string, resumeMarker: string): Record<string, WatchRun> {
	const source = `patch_places:${territory.id}`;
	const finishedAt = resumeMarker.includes('>') ? null : startedAt;
	return { [source]: { id: `run-${territory.id}`, source, startedAt, finishedAt, rowsWritten: 0, resumeMarker, note: '' } };
}

function loadNext() {
	return tradingPlacesSource.run(supabase, aFreshStart, noProgress);
}

describe('loading the trading places of the territories behind the newest release', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		territories = [surbiton, sutton, woking];
		lastLoads = {};
		loaded.mockResolvedValue({ source: 'patch_places', rowsWritten: 9_961, resumeMarker: holdingNewest, note: 'Release 2026-10-21.0: 9961 trading places held.', isFinished: true });
	});

	it('is finished, loading nothing, when every territory holds the newest release', async () => {
		lastLoads = { ...loadOf(surbiton, '2026-11-16T02:50:00Z', holdingNewest), ...loadOf(sutton, '2026-11-16T03:50:00Z', holdingNewest), ...loadOf(woking, '2026-11-16T04:50:00Z', holdingNewest) };
		expect(await loadNext()).toEqual({ rowsWritten: 0, resumeMarker: '', note: 'Every territory holds release 2026-10-21.0.', isFinished: true });
		expect(loaded).not.toHaveBeenCalled();
	});

	it("loads one territory a run through that territory's own watcher, and is not finished while another is behind", async () => {
		lastLoads = loadOf(sutton, '2026-11-16T02:50:00Z', holdingNewest);
		expect(await loadNext()).toEqual({ rowsWritten: 9_961, resumeMarker: surbiton.id, note: 'Surbiton: Release 2026-10-21.0: 9961 trading places held.', isFinished: false });
		expect(loaded).toHaveBeenCalledTimes(1);
		expect(loaded).toHaveBeenCalledWith(supabase, expect.objectContaining({ name: 'patch_places:surbiton-id' }));
	});

	it('counts as behind a territory that holds the release before, and one whose load stopped part way', async () => {
		lastLoads = { ...loadOf(surbiton, '2026-11-16T02:50:00Z', holdingNewest), ...loadOf(sutton, '2026-10-22T02:50:00Z', releaseBefore), ...loadOf(woking, '2026-11-16T03:50:00Z', '>2026-10-21.0:4500') };
		expect(await loadNext()).toMatchObject({ resumeMarker: sutton.id, isFinished: false });
		lastLoads = { ...lastLoads, ...loadOf(sutton, '2026-11-16T04:50:00Z', holdingNewest) };
		expect(await loadNext()).toMatchObject({ resumeMarker: woking.id });
	});

	it('is finished once the last territory behind holds the release, and not when that load was cut off part way', async () => {
		lastLoads = { ...loadOf(surbiton, '2026-11-16T02:50:00Z', holdingNewest), ...loadOf(sutton, '2026-11-16T03:50:00Z', holdingNewest) };
		expect(await loadNext()).toMatchObject({ resumeMarker: woking.id, isFinished: true });
		loaded.mockResolvedValue({ source: 'patch_places', rowsWritten: 4_500, resumeMarker: '>2026-10-21.0:4500', note: 'Release 2026-10-21.0: 4500 of 9961 trading places written so far.', isFinished: false });
		expect(await loadNext()).toMatchObject({ rowsWritten: 4_500, note: 'Woking: Release 2026-10-21.0: 4500 of 9961 trading places written so far.', isFinished: false });
	});

	it('counts as behind a territory that holds the newest release from before its places were placed by their point', async () => {
		lastLoads = { ...loadOf(surbiton, '2026-11-16T02:50:00Z', newestRelease), ...loadOf(sutton, '2026-11-16T03:50:00Z', holdingNewest), ...loadOf(woking, '2026-11-16T04:50:00Z', holdingNewest) };
		expect(await loadNext()).toMatchObject({ resumeMarker: surbiton.id, isFinished: true });
	});

	it('takes the territory never tried before one whose load keeps stopping, so a load that fails never holds up the rest', async () => {
		lastLoads = { ...loadOf(surbiton, '2026-11-16T02:50:00Z', '>2026-10-21.0:0'), ...loadOf(sutton, '2026-11-15T02:50:00Z', '>2026-10-21.0:0') };
		expect(await loadNext()).toMatchObject({ resumeMarker: woking.id });
		lastLoads = { ...lastLoads, ...loadOf(woking, '2026-11-16T03:50:00Z', '>2026-10-21.0:0') };
		expect(await loadNext()).toMatchObject({ resumeMarker: sutton.id });
	});
});
