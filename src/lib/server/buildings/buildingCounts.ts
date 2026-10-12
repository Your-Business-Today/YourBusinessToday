import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';

/** What a sector's buildings add up to: how many, the places they hold, and how many have a business known in or beside them. */
export type BuildingCounts = { buildingCount: number; placeCount: number; knownCount: number };

/** The counts by sector, or none until the buildings migration has run. */
export async function readBuildingCountsBySector(supabase: SupabaseClient, patchId: string): Promise<Record<string, BuildingCounts>> {
	const { data, error } = await supabase.rpc('patch_building_counts', { target_patch_id: patchId });
	if (error !== null && isSchemaNotYetMigrated(error)) return {};
	if (error) throw error;
	return Object.fromEntries(
		data.map((row: Record<string, unknown>) => [
			row.sector as string,
			{ buildingCount: Number(row.building_count ?? 0), placeCount: Number(row.place_count ?? 0), knownCount: Number(row.known_count ?? 0) }
		])
	);
}
