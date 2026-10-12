import type { SupabaseClient } from '@supabase/supabase-js';
import { outcodeOf } from '$lib/data/postcode';
import type { NearestPostcode } from './nearestPostcode';
import type { PlacedBuilding } from './placeUprns';
import type { UprnPoint } from './uprnRows';

export const buildingsSource = 'os_open_buildings';
const buildingsPerBatch = 200;
const pointsPerBatch = 1000;

/** A building ready to write: placed, counted, and given its nearest postcode. */
export type BuildingSeed = { id: string; building: PlacedBuilding; nearest: NearestPostcode | null };

/** A reload replaces the patch's buildings whole: the footprints carry no id of their own to update by. */
export async function replacePatchBuildings(supabase: SupabaseClient, patchId: string, seeds: BuildingSeed[], release: string): Promise<void> {
	const { error } = await supabase.from('buildings').delete().eq('patch_id', patchId);
	if (error) throw error;
	for (let start = 0; start < seeds.length; start += buildingsPerBatch) {
		const rows = seeds.slice(start, start + buildingsPerBatch).map((seed) => buildingRowOf(seed, patchId, release));
		const { error: insertError } = await supabase.from('buildings').insert(rows);
		if (insertError) throw insertError;
	}
}

export async function writePremisesPoints(supabase: SupabaseClient, points: UprnPoint[], buildingIdOf: Map<number, string>): Promise<void> {
	for (let start = 0; start < points.length; start += pointsPerBatch) {
		const rows = points.slice(start, start + pointsPerBatch).map((point) => ({
			uprn: point.uprn,
			latitude: point.latitude,
			longitude: point.longitude,
			building_id: buildingIdOf.get(point.uprn) ?? null,
			loaded_at: new Date().toISOString()
		}));
		const { error } = await supabase.from('premises_points').upsert(rows, { onConflict: 'uprn' });
		if (error) throw error;
	}
}

function buildingRowOf(seed: BuildingSeed, patchId: string, release: string): Record<string, unknown> {
	const { footprint, uprns } = seed.building;
	const { nearest } = seed;
	const { latitude, longitude } = footprint.centreOnGround;
	return {
		id: seed.id,
		patch_id: patchId,
		footprint: footprint.geoJson,
		centre_latitude: latitude,
		centre_longitude: longitude,
		area_square_metres: footprint.areaSquareMetres,
		uprn_count: uprns.length,
		nearest_postcode: nearest?.postcode ?? '',
		postcode_distance_metres: nearest === null ? null : Math.round(nearest.distanceMetres),
		outcode: nearest === null ? '' : outcodeOf(nearest.postcode),
		sector: nearest?.sector ?? '',
		source_release: release
	};
}

export async function recordBuildingsRun(supabase: SupabaseClient, rowsWritten: number, release: string, startedAt: string): Promise<void> {
	const { error } = await supabase.from('watch_runs').insert({
		source: buildingsSource,
		started_at: startedAt,
		finished_at: new Date().toISOString(),
		rows_written: rowsWritten,
		resume_marker: release
	});
	if (error) throw error;
}
