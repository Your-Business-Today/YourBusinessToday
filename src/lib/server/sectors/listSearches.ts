import type { SupabaseClient } from '@supabase/supabase-js';
import { parseSectorSearchRecord, sectorSearchColumns, type RecordedSectorSearch } from './sectorSearchRecord';

/** Every search of the patch, newest first. */
export async function listSearchesForPatch(supabase: SupabaseClient, patchId: string): Promise<RecordedSectorSearch[]> {
	const { data, error } = await supabase
		.from('sector_searches')
		.select(sectorSearchColumns)
		.eq('patch_id', patchId)
		.order('searched_at', { ascending: false });
	if (error) throw error;
	return data.map(parseSectorSearchRecord);
}

/** Every search of one sector, in any patch, newest first: what another person reads to judge the coverage. */
export async function listSearchesForSector(supabase: SupabaseClient, sector: string): Promise<RecordedSectorSearch[]> {
	const { data, error } = await supabase
		.from('sector_searches')
		.select(sectorSearchColumns)
		.eq('sector', sector)
		.order('searched_at', { ascending: false });
	if (error) throw error;
	return data.map(parseSectorSearchRecord);
}
