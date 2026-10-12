import type { SupabaseClient } from '@supabase/supabase-js';
import { cacheLocations, readCachedLocations } from './postcodeLocationCache';
import { inBatches } from '$lib/data/inBatches';
import { parsePostcodeLocation, type PostcodeLocation } from './postcodeLocation';
import { postcodeIn } from '$lib/data/postcode';
import { postcodesApiOrigin, requestPostcodes } from './postcodesRequest';

const bulkLookupPath = '/postcodes';
const longestBulkLookup = 100;

export type GeocodedPostcodes = Map<string, PostcodeLocation>;

export async function geocodePostcodes(
	supabase: SupabaseClient,
	candidates: string[]
): Promise<GeocodedPostcodes> {
	const postcodes = [...new Set(candidates.map(postcodeIn).filter((postcode) => postcode !== ''))];
	const cached = await readCachedLocations(supabase, postcodes);
	const located: GeocodedPostcodes = new Map(cached.map((location) => [location.postcode, location]));
	const missing = postcodes.filter((postcode) => !located.has(postcode));
	const fetched = await lookupInBatches(missing);
	for (const location of fetched) located.set(location.postcode, location);
	await cacheLocations(supabase, fetched);
	return located;
}

async function lookupInBatches(postcodes: string[]): Promise<PostcodeLocation[]> {
	const results = await Promise.all(inBatches(postcodes, longestBulkLookup).map(lookupBatch));
	return results.flat();
}

async function lookupBatch(postcodes: string[]): Promise<PostcodeLocation[]> {
	const url = new URL(bulkLookupPath, postcodesApiOrigin);
	const body = await requestPostcodes(url, { postcodes });
	const results = Array.isArray(body.result) ? (body.result as Record<string, unknown>[]) : [];
	return results
		.map((entry) => parsePostcodeLocation(entry.result))
		.filter((location): location is PostcodeLocation => location !== null);
}
