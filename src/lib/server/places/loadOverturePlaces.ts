import type { SupabaseClient } from '@supabase/supabase-js';
import { findNewestRelease } from './overtureReleases';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { inBatches } from '$lib/data/inBatches';
import { heldWholeMarkerOf, isHoldingWhole, loadingMarkerOf, parsePlacesStanding } from './placesStanding';
import { nearestPostcodesOf } from './placesByPoint';
import { markPlacesGone, placesPerBatch, upsertPlaceBatch, type PlacesLoad } from './placesWriter';
import { patchBoundsOnGround } from '$lib/data/patchBounds';
import { placesHeldNote, placesPartWayNote } from './placesLoadNotes';
import { readPlacesInRelease, type PlacesReading } from './readPlacesInRelease';
import { placesListingNoPostcode, sortPlacesForPatch, type GroundedPlace, type PlacesSorted } from './placesForPatch';
import type { MapBounds } from '$lib/data/mapBounds';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { WatchOutcome } from '$lib/server/watch/watchRunLog';
import type { WatchProgress, WatchStart } from '$lib/server/watch/watchSource';

/** How long one run goes on writing: a call through the connector must answer inside two minutes, and the release is read in that time too. */
const turnMilliseconds = 90_000;

/** When a run stops writing, and how it marks how many places it has written so far. */
type WritingTurn = { stopAt: number; mark: (writtenThisRun: number) => Promise<void> };

/**
 * One territory's trading places from the newest release Overture keeps: read from Overture's own bucket, the ones
 * that list no postcode placed by the postcode nearest their point, sorted by the rules, and written a batch at a time.
 * A territory that already holds the newest release, loaded with its places placed by their point, is left alone. A
 * load that runs out of time says where it stopped, and the next run carries on there while that release is still the
 * newest. A territory's first load writes nothing to the feed: thousands of places arriving at once is not news. Nor
 * does the load that tops up a territory loaded before places were placed by their point: the places it already held
 * are written again unchanged, and the ones placed by their point were always there, so none of it is news either.
 */
export async function loadOverturePlacesForPatch(supabase: SupabaseClient, patch: Patch, start: WatchStart, progress: WatchProgress): Promise<WatchOutcome> {
	const stopAt = Date.now() + turnMilliseconds;
	const standing = parsePlacesStanding(start.resumeMarker);
	const release = await findNewestRelease();
	const heldWhole = heldWholeMarkerOf(release);
	if (isHoldingWhole(standing, release)) return { rowsWritten: 0, resumeMarker: heldWhole, note: `Already holds release ${release}.`, isFinished: true };
	const writtenBefore = standing.loadingRelease === release ? standing.writtenCount : 0;
	const markerAt = (written: number) => loadingMarkerOf({ ...standing, loadingRelease: release, writtenCount: written });
	await progress(markerAt(writtenBefore), 0);
	const reading = await readPlacesInRelease(release, await boxAround(supabase, patch));
	const sorted = await placesSortedForPatch(reading, patch);
	const { toWrite } = sorted;
	const load = { release, seenAt: new Date().toISOString(), isFirstLoad: !standing.isPlacedByPoint };
	const mark = (writtenThisRun: number) => progress(markerAt(writtenBefore + writtenThisRun), writtenThisRun);
	const rowsWritten = await writeUntil(supabase, toWrite.slice(writtenBefore), load, { stopAt, mark });
	const writtenSoFar = writtenBefore + rowsWritten;
	if (writtenSoFar < toWrite.length) return { rowsWritten, resumeMarker: markerAt(writtenSoFar), note: placesPartWayNote(release, writtenSoFar, toWrite.length), isFinished: false };
	const goneCount = await markPlacesGone(supabase, reading.goneIds, load.seenAt);
	return { rowsWritten, resumeMarker: heldWhole, note: placesHeldNote(release, sorted, { unreadableCount: reading.unreadableCount, goneCount }), isFinished: true };
}

/** The release's places sorted for the territory, once the ones that list no postcode are given the postcode nearest their point. */
async function placesSortedForPatch(reading: PlacesReading, patch: Patch): Promise<PlacesSorted> {
	const nearest = await nearestPostcodesOf(placesListingNoPostcode(reading.trading));
	return sortPlacesForPatch(reading.trading, patch, nearest);
}

/**
 * Writes the places a batch at a time, marking how far it has got after each, until none is left or the time is up.
 * The first batch is written whatever the time, so a release that was slow to read never leaves a load standing still.
 */
async function writeUntil(supabase: SupabaseClient, places: GroundedPlace[], load: PlacesLoad, turn: WritingTurn): Promise<number> {
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
