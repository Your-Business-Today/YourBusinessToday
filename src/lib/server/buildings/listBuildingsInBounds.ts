import type { SupabaseClient } from '@supabase/supabase-js';
import { buildingColumns, parseBuildingRecord, type Building } from './buildingRecord';
import type { MapBounds } from '$lib/data/mapBounds';

/** The most footprints one view draws; a view that holds more shows the largest. */
export const mostBuildingsDrawn = 4000;

export async function listBuildingsInBounds(supabase: SupabaseClient, patchId: string, bounds: MapBounds): Promise<Building[]> {
	const { data, error } = await supabase
		.from('buildings')
		.select(buildingColumns)
		.eq('patch_id', patchId)
		.gte('centre_latitude', bounds.south)
		.lte('centre_latitude', bounds.north)
		.gte('centre_longitude', bounds.west)
		.lte('centre_longitude', bounds.east)
		.order('area_square_metres', { ascending: false })
		.limit(mostBuildingsDrawn);
	if (error) throw error;
	return data.map(parseBuildingRecord);
}
