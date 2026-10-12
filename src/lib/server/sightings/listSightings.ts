import type { SupabaseClient } from '@supabase/supabase-js';
import { isUuid } from '$lib/data/isUuid';
import { parseSightingRecord, sightingColumns, type Sighting } from './sightingRecord';

/** Every sighting in the patch's outcodes, whoever made it and from whichever patch, newest first. */
export async function listSightingsForPatch(supabase: SupabaseClient, outcodes: string[]): Promise<Sighting[]> {
	if (outcodes.length === 0) return [];
	const { data, error } = await supabase
		.from('sightings')
		.select(sightingColumns)
		.or(outcodes.map((outcode) => `sector.like.${outcode} %`).join(','))
		.order('seen_at', { ascending: false });
	if (error) throw error;
	return data.map(parseSightingRecord);
}

export async function getSighting(supabase: SupabaseClient, sightingId: string): Promise<Sighting | null> {
	if (!isUuid(sightingId)) return null;
	const { data, error } = await supabase.from('sightings').select(sightingColumns).eq('id', sightingId).maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseSightingRecord(data);
}
