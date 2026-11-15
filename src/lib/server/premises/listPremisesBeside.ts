import type { SupabaseClient } from '@supabase/supabase-js';
import { boundsAround } from '$lib/data/patchBounds';
import { buildingNearbyMetres } from '$lib/data/buildingNeighbours';
import { distanceInMetres, type Coordinates } from '$lib/data/distance';
import { parsePremisesRecord, premisesColumns, type Premises } from './premisesRecord';

/**
 * The premises still trading in the patch's outcodes whose own geocode puts them in or beside the point, by name.
 * The database is asked for the small box around the point alone, never for the territory's thousands.
 */
export async function listPremisesBeside(supabase: SupabaseClient, outcodes: string[], point: Coordinates): Promise<Premises[]> {
	if (outcodes.length === 0) return [];
	const box = boundsAround(point, buildingNearbyMetres);
	const { data, error } = await supabase
		.from('premises')
		.select(premisesColumns)
		.in('outcode', outcodes)
		.eq('is_gone', false)
		.gte('latitude', box.south)
		.lte('latitude', box.north)
		.gte('longitude', box.west)
		.lte('longitude', box.east)
		.order('business_name')
		.order('id');
	if (error) throw error;
	return data.map(parsePremisesRecord).filter((one) => isBeside(one, point));
}

function isBeside(premises: Premises, point: Coordinates): boolean {
	const { latitude, longitude } = premises;
	if (latitude === null || longitude === null) return false;
	return distanceInMetres(point, { latitude, longitude }) <= buildingNearbyMetres;
}
