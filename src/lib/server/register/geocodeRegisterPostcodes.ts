import type { SupabaseClient } from '@supabase/supabase-js';
import { geocodePostcodes } from '$lib/server/postcodes/geocodePostcodes';

export type GeocodingProgress = { geocodedCount: number; remainingCount: number };

const postcodesPerPage = 100;

/** Geocodes one page of register postcodes no patch has located yet, through the cache the map uses, and says how many remain. */
export async function geocodeRegisterPostcodes(supabase: SupabaseClient): Promise<GeocodingProgress> {
	const { data, error } = await supabase.rpc('register_postcodes_to_geocode', { page_size: postcodesPerPage });
	if (error) throw error;
	const postcodes = data.map((row: Record<string, unknown>) => row.postcode as string);
	const located = await geocodePostcodes(supabase, postcodes);
	return { geocodedCount: located.size, remainingCount: await countRegisterPostcodesToGeocode(supabase) };
}

export async function countRegisterPostcodesToGeocode(supabase: SupabaseClient): Promise<number> {
	const { data, error } = await supabase.rpc('count_register_postcodes_to_geocode');
	if (error) throw error;
	return Number(data ?? 0);
}
