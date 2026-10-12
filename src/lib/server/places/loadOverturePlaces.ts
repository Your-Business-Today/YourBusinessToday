import type { SupabaseClient } from '@supabase/supabase-js';
import { changelogPathFor, placesInBoundsQuery, placesPathFor, removedPlacesQuery } from './overtureQueries';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { markPlacesGone, readPlaceIds, recordPlacesRun, upsertPlaces } from './placesWriter';
import { patchBoundsOnGround } from '$lib/data/patchBounds';
import { readPlaceRow } from './placeRow';
import { validatePlace, type PlaceSeed } from '$lib/data/placeRules';
import type { ParquetReader } from './duckDb';
import type { Patch } from '$lib/server/patches/patchRecord';

export type PlacesLoadSummary = { written: number; refused: number; removed: number };

/** One patch from one release: every place in its box with a licence we may hold, and the ones the changelog removed since. */
export async function loadOverturePlacesForPatch(supabase: SupabaseClient, reader: ParquetReader, patch: Patch, release: string): Promise<PlacesLoadSummary> {
	const startedAt = new Date().toISOString();
	const located = await geocodePostcodes(supabase, [patch.centrePostcode]);
	const centre = located.get(patch.centrePostcode);
	if (centre === undefined) throw new Error(`${patch.name}: the centre postcode is not located`);
	const bounds = patchBoundsOnGround(centre, patch.radiusMiles);
	const rows = await reader.rows(placesInBoundsQuery(placesPathFor(release), bounds));
	const { kept, refused } = keepWhatFits(rows.map(readPlaceRow));
	const inOutcodes = kept.filter((place) => place.postcode === '' || patch.outcodes.some((outcode) => place.postcode.startsWith(`${outcode} `)));
	const written = await upsertPlaces(supabase, inOutcodes, release, startedAt);
	const removed = await markRemoved(supabase, reader, patch, release, startedAt);
	await recordPlacesRun(supabase, written, release, `${patch.name}: ${refused} rows refused, ${removed} removed by the changelog.`, startedAt);
	return { written, refused, removed };
}

async function markRemoved(supabase: SupabaseClient, reader: ParquetReader, patch: Patch, release: string, seenAt: string): Promise<number> {
	const held = await readPlaceIds(supabase, patch.outcodes);
	if (held.length === 0) return 0;
	const removedRows = await reader.rows(removedPlacesQuery(changelogPathFor(release), held));
	return markPlacesGone(supabase, removedRows.map((row) => String(row.id ?? '')), seenAt);
}

function keepWhatFits(seeds: (PlaceSeed | null)[]): { kept: PlaceSeed[]; refused: number } {
	const kept: PlaceSeed[] = [];
	let refused = 0;
	for (const seed of seeds) {
		const refusal = seed === null ? 'no id, name or point' : validatePlace(seed);
		if (refusal === null && seed !== null) kept.push(seed);
		if (refusal !== null) refused += 1;
	}
	return { kept, refused };
}
