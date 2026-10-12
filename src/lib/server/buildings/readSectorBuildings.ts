import type { SupabaseClient } from '@supabase/supabase-js';
import { buildingNearbyMetres } from '$lib/data/buildingNeighbours';
import { distanceInMetres } from '$lib/data/distance';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { listBuildingsForSector } from './listBuildingsForSector';
import { listPremisesForPatch } from '$lib/server/premises/listPremisesForPatch';
import type { Building } from './buildingRecord';
import type { Premises } from '$lib/server/premises/premisesRecord';

/** A building as a Claude reads it: the places it holds and the premises known in or beside it. */
export type BuildingReading = { building: Building; knownNearby: string[] };

/** The largest buildings of the sector with what is known in each, or none until the buildings migration has run. */
export async function readSectorBuildings(supabase: SupabaseClient, patchId: string, outcodes: string[], sector: string): Promise<BuildingReading[]> {
	try {
		const [buildings, premises] = await Promise.all([listBuildingsForSector(supabase, patchId, sector), listPremisesForPatch(supabase, outcodes)]);
		return buildings.map((building) => ({ building, knownNearby: premisesBeside(building, premises) }));
	} catch (failure) {
		if (isSchemaNotYetMigrated(failure)) return [];
		throw failure;
	}
}

function premisesBeside(building: Building, premises: Premises[]): string[] {
	return premises
		.filter((one) => one.latitude !== null && one.longitude !== null)
		.filter((one) => distanceInMetres(building, { latitude: one.latitude ?? 0, longitude: one.longitude ?? 0 }) <= buildingNearbyMetres)
		.map((one) => one.businessName);
}
