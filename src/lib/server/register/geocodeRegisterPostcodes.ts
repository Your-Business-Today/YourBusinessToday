import type { SupabaseClient } from '@supabase/supabase-js';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';
import { rememberPostcodesNotFound } from '$lib/server/postcodes/postcodesNotFoundWriter';

export type GeocodingProgress = { geocodedCount: number; remainingCount: number };

/** Told how far the geocoding has got after each page, by whoever keeps a record of the run. */
export type PageGeocoded = (progress: GeocodingProgress) => Promise<void>;

const postcodesPerPage = 100;

/**
 * Geocodes one page of register postcodes no patch has located yet, through the cache the map uses, and says how many remain.
 * A postcode the postcode service does not know is remembered, so it is not served again on the next page.
 */
export async function geocodeRegisterPostcodes(supabase: SupabaseClient): Promise<GeocodingProgress> {
	const { data, error } = await supabase.rpc('register_postcodes_to_geocode', { page_size: postcodesPerPage });
	if (error) throw error;
	const postcodes: string[] = data.map((row: Record<string, unknown>) => row.postcode as string);
	const located = await geocodePostcodes(supabase, postcodes);
	await rememberPostcodesNotFound(supabase, postcodes.filter((postcode) => !located.has(postcode)));
	return { geocodedCount: located.size, remainingCount: await countRegisterPostcodesToGeocode(supabase) };
}

/** Geocodes page after page until none remain or the moment given has passed, and says how many it located and how many remain. */
export async function geocodeRegisterPostcodesUntil(supabase: SupabaseClient, stopAtMilliseconds: number, onPageGeocoded?: PageGeocoded): Promise<GeocodingProgress> {
	let geocodedCount = 0;
	let remainingCount = 0;
	do {
		const page = await geocodeRegisterPostcodes(supabase);
		geocodedCount += page.geocodedCount;
		remainingCount = page.remainingCount;
		await onPageGeocoded?.({ geocodedCount, remainingCount });
	} while (remainingCount > 0 && Date.now() < stopAtMilliseconds);
	return { geocodedCount, remainingCount };
}

export async function countRegisterPostcodesToGeocode(supabase: SupabaseClient): Promise<number> {
	const { data, error } = await supabase.rpc('count_register_postcodes_to_geocode');
	if (error) throw error;
	return Number(data ?? 0);
}
