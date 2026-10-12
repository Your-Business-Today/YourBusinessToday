import type { SupabaseClient } from '@supabase/supabase-js';
import { outcodeOf, sectorOf } from '$lib/data/postcode';
import type { PlaceSeed } from '$lib/data/placeRules';

export const placesSource = 'overture_places';
const rowsPerBatch = 500;
const idsPerBatch = 1000;

export async function upsertPlaces(supabase: SupabaseClient, places: PlaceSeed[], release: string, seenAt: string): Promise<number> {
	let written = 0;
	for (let start = 0; start < places.length; start += rowsPerBatch) {
		const rows = places.slice(start, start + rowsPerBatch).map((place) => placeRowOf(place, release));
		const { data, error } = await supabase.rpc('upsert_places', { rows, seen_at: seenAt });
		if (error) throw error;
		written += Number(data ?? 0);
	}
	return written;
}

export async function markPlacesGone(supabase: SupabaseClient, sourceIds: string[], seenAt: string): Promise<number> {
	let marked = 0;
	for (let start = 0; start < sourceIds.length; start += idsPerBatch) {
		const { data, error } = await supabase.rpc('mark_places_gone', { gone_ids: sourceIds.slice(start, start + idsPerBatch), seen_at: seenAt });
		if (error) throw error;
		marked += Number(data ?? 0);
	}
	return marked;
}

/** The ids of every place still held in the patch's outcodes, for the changelog to be asked about. */
export async function readPlaceIds(supabase: SupabaseClient, outcodes: string[]): Promise<string[]> {
	if (outcodes.length === 0) return [];
	const { data, error } = await supabase.from('premises').select('source_id').eq('source', 'places_dataset').eq('is_gone', false).in('outcode', outcodes);
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => row.source_id as string);
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

export async function recordPlacesRun(supabase: SupabaseClient, rowsWritten: number, release: string, note: string, startedAt: string): Promise<void> {
	const { error } = await supabase.from('watch_runs').insert({ source: placesSource, started_at: startedAt, finished_at: new Date().toISOString(), rows_written: rowsWritten, resume_marker: release, note });
	if (error) throw error;
}
