import type { SupabaseClient } from '@supabase/supabase-js';
import { eachBatchInTurn, inBatches } from '$lib/data/inBatches';
import type { PostcodeLocation } from './postcodeLocation';

const cacheTable = 'postcode_locations';
/** Postcodes named in one read: a wide map asks after thousands, which in one address is longer than the database will take. */
const postcodesReadAtOnce = 200;
const locationsWrittenAtOnce = 500;

export async function readCachedLocations(
	supabase: SupabaseClient,
	postcodes: string[]
): Promise<PostcodeLocation[]> {
	return eachBatchInTurn(postcodes, postcodesReadAtOnce, (batch) => readCachedBatch(supabase, batch));
}

async function readCachedBatch(supabase: SupabaseClient, postcodes: string[]): Promise<PostcodeLocation[]> {
	const { data, error } = await supabase
		.from(cacheTable)
		.select('postcode, outcode, latitude, longitude')
		.in('postcode', postcodes);
	if (error) throw error;
	return data.map((row: Record<string, unknown>) => ({
		postcode: row.postcode as string,
		outcode: row.outcode as string,
		latitude: Number(row.latitude),
		longitude: Number(row.longitude)
	}));
}

export async function cacheLocations(
	supabase: SupabaseClient,
	locations: PostcodeLocation[]
): Promise<void> {
	for (const batch of inBatches(locations, locationsWrittenAtOnce)) await cacheBatch(supabase, batch);
}

async function cacheBatch(supabase: SupabaseClient, locations: PostcodeLocation[]): Promise<void> {
	const { error } = await supabase.from(cacheTable).upsert(
		locations.map((location) => ({
			postcode: location.postcode,
			outcode: location.outcode,
			latitude: location.latitude,
			longitude: location.longitude,
			looked_up_at: new Date().toISOString()
		})),
		{ onConflict: 'postcode' }
	);
	if (error) throw error;
}
