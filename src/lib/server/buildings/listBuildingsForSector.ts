import type { SupabaseClient } from '@supabase/supabase-js';
import { buildingColumns, parseBuildingRecord, type Building } from './buildingRecord';

/** The largest buildings of a sector by the places they hold, as many as a reading shows. */
export const mostBuildingsRead = 12;

export async function listBuildingsForSector(supabase: SupabaseClient, patchId: string, sector: string): Promise<Building[]> {
	const { data, error } = await supabase
		.from('buildings')
		.select(buildingColumns)
		.eq('patch_id', patchId)
		.eq('sector', sector)
		.order('uprn_count', { ascending: false })
		.limit(mostBuildingsRead);
	if (error) throw error;
	return data.map(parseBuildingRecord);
}
