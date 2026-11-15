import type { SupabaseClient } from '@supabase/supabase-js';
import { inBatches } from '$lib/data/inBatches';
import { outcodeOf, sectorOf } from '$lib/data/postcode';
import type { PlaceSeed } from '$lib/data/placeRules';

/** The places written in one request: few enough to be answered in seconds, so a load cut off loses little. */
export const placesPerBatch = 500;
const idsPerBatch = 1000;

/** What every place of one load is written with: its release, when the load saw it, and whether the territory held none before. */
export type PlacesLoad = { release: string; seenAt: string; isFirstLoad: boolean };

/** Writes one batch of places, new or already held, and says how many. A territory's first load writes nothing to the feed. */
export async function upsertPlaceBatch(supabase: SupabaseClient, places: PlaceSeed[], load: PlacesLoad): Promise<number> {
	const rows = places.map((place) => placeRowOf(place, load.release));
	const { data, error } = await supabase.rpc('upsert_places', { rows, seen_at: load.seenAt, is_first_load: load.isFirstLoad });
	if (error) throw error;
	return Number(data ?? 0);
}

/** Marks gone the places a release closed or took out, and says how many of them were held and still open. */
export async function markPlacesGone(supabase: SupabaseClient, sourceIds: string[], seenAt: string): Promise<number> {
	let marked = 0;
	for (const goneIds of inBatches(sourceIds, idsPerBatch)) {
		const { data, error } = await supabase.rpc('mark_places_gone', { gone_ids: goneIds, seen_at: seenAt });
		if (error) throw error;
		marked += Number(data ?? 0);
	}
	return marked;
}

function placeRowOf(place: PlaceSeed, release: string): Record<string, unknown> {
	return {
		source_id: place.sourceId,
		business_name: place.businessName,
		category: place.category,
		address: place.address,
		postcode: place.postcode,
		sector: sectorOf(place.postcode),
		outcode: outcodeOf(place.postcode),
		latitude: place.latitude,
		longitude: place.longitude,
		website: place.website,
		phone: place.phone,
		confidence: place.confidence,
		release,
		source_licence: place.sourceLicence,
		source_url: `https://explore.overturemaps.org/#${place.sourceId}`
	};
}
