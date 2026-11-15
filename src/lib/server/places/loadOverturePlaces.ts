import type { SupabaseClient } from '@supabase/supabase-js';
import { findNewestRelease } from './overtureReleases';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { inBatches } from '$lib/data/inBatches';
import { loadingMarkerOf, parsePlacesStanding } from './placesStanding';
import { markPlacesGone, placesPerBatch, upsertPlaceBatch, type PlacesLoad } from './placesWriter';
import { patchBoundsOnGround } from '$lib/data/patchBounds';
import { placesHeldNote, placesPartWayNote } from './placesLoadNotes';
import { readPlacesInRelease } from './readPlacesInRelease';
import { sortPlacesForPatch } from './placesForPatch';
import type { MapBounds } from '$lib/data/mapBounds';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { PlaceSeed } from '$lib/data/placeRules';
import type { WatchOutcome } from '$lib/server/watch/watchRunLog';
import type { WatchProgress, WatchStart } from '$lib/server/watch/watchSource';

/** How long one run goes on writing: a call through the connector must answer inside two minutes, and the release is read in that time too. */
const turnMilliseconds = 90_000;
const neverLoaded = '';

/** When a run stops writing, and how it marks how many places it has written so far. */
type WritingTurn = { stopAt: number; mark: (writtenThisRun: number) => Promise<void> };

/**
 * One territory's trading places from the newest release Overture keeps: read from Overture's own bucket, sorted by
 * the rules, and written a batch at a time. A territory that already holds the newest release is left alone. A load
 * that runs out of time says where it stopped, and the next run carries on there while that release is still the
 * newest. A territory's first load writes nothing to the feed: thousands of places arriving at once is not news.
 */
export async function loadOverturePlacesForPatch(supabase: SupabaseClient, patch: Patch, start: WatchStart, progress: WatchProgress): Promise<WatchOutcome> {
	const stopAt = Date.now() + turnMilliseconds;
	const { heldRelease, loadingRelease, writtenCount } = parsePlacesStanding(start.resumeMarker);
	const release = await findNewestRelease();
	if (heldRelease === release) return { rowsWritten: 0, resumeMarker: release, note: `Already holds release ${release}.`, isFinished: true };
	const writtenBefore = loadingRelease === release ? writtenCount : 0;
	const markerAt = (written: number) => loadingMarkerOf({ heldRelease, loadingRelease: release, writtenCount: written });
	await progress(markerAt(writtenBefore), 0);
	const reading = await readPlacesInRelease(release, await boxAround(supabase, patch));
	const sorted = sortPlacesForPatch(reading.trading, patch);
	const { toWrite } = sorted;
	const load = { release, seenAt: new Date().toISOString(), isFirstLoad: heldRelease === neverLoaded };
	const mark = (writtenThisRun: number) => progress(markerAt(writtenBefore + writtenThisRun), writtenThisRun);
	const rowsWritten = await writeUntil(supabase, toWrite.slice(writtenBefore), load, { stopAt, mark });
	const writtenSoFar = writtenBefore + rowsWritten;
	if (writtenSoFar < toWrite.length) return { rowsWritten, resumeMarker: markerAt(writtenSoFar), note: placesPartWayNote(release, writtenSoFar, toWrite.length), isFinished: false };
	const goneCount = await markPlacesGone(supabase, reading.goneIds, load.seenAt);
	return { rowsWritten, resumeMarker: release, note: placesHeldNote(release, sorted, { unreadableCount: reading.unreadableCount, goneCount }), isFinished: true };
}

/**
 * Writes the places a batch at a time, marking how far it has got after each, until none is left or the time is up.
 * The first batch is written whatever the time, so a release that was slow to read never leaves a load standing still.
 */
async function writeUntil(supabase: SupabaseClient, places: PlaceSeed[], load: PlacesLoad, turn: WritingTurn): Promise<number> {
	let written = 0;
	for (const batch of inBatches(places, placesPerBatch)) {
		const isOutOfTime = written > 0 && Date.now() > turn.stopAt;
		if (isOutOfTime) return written;
		await upsertPlaceBatch(supabase, batch, load);
		written += batch.length;
		await turn.mark(written);
	}
	return written;
}

/** The box on the ground that holds the territory's circle. */
async function boxAround(supabase: SupabaseClient, patch: Patch): Promise<MapBounds> {
	const located = await geocodePostcodes(supabase, [patch.centrePostcode]);
	const centre = located.get(patch.centrePostcode);
	if (centre === undefined) throw new Error(`${patch.name}: the centre postcode is not located`);
	return patchBoundsOnGround(centre, patch.radiusMiles);
}
