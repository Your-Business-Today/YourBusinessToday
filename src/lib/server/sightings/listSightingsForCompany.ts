import type { SupabaseClient } from '@supabase/supabase-js';
import { parseSightingRecord, sightingColumns, type Sighting } from './sightingRecord';

/** Every sighting matched to the company by number, from any patch, newest first. */
export async function listSightingsForCompany(supabase: SupabaseClient, companyNumber: string): Promise<Sighting[]> {
	if (companyNumber === '') return [];
	const { data, error } = await supabase
		.from('sightings')
		.select(sightingColumns)
		.eq('company_number', companyNumber)
		.order('seen_at', { ascending: false });
	if (error) throw error;
	return data.map(parseSightingRecord);
}
