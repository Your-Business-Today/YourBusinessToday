import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { listBuildingsForSector } from './listBuildingsForSector';
import { listPremisesBeside } from '$lib/server/premises/listPremisesBeside';
import type { Building } from './buildingRecord';

/** A building as a Claude reads it: the places it holds and the premises known in or beside it. */
export type BuildingReading = { building: Building; knownNearby: string[] };

/** The largest buildings of the sector with what is known in each, or none until the buildings migration has run. */
export async function readSectorBuildings(supabase: SupabaseClient, patchId: string, outcodes: string[], sector: string): Promise<BuildingReading[]> {
	try {
		const buildings = await listBuildingsForSector(supabase, patchId, sector);
		return await Promise.all(buildings.map((building) => readBuilding(supabase, outcodes, building)));
	} catch (failure) {
		if (isSchemaNotYetMigrated(failure)) return [];
		throw failure;
	}
}

async function readBuilding(supabase: SupabaseClient, outcodes: string[], building: Building): Promise<BuildingReading> {
	const premisesBeside = await listPremisesBeside(supabase, outcodes, building);
	return { building, knownNearby: premisesBeside.map((one) => one.businessName) };
}
