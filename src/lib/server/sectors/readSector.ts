import type { SupabaseClient } from '@supabase/supabase-js';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { listSearchesForSector } from './listSearches';
import { readPatchCoverage } from './patchCoverage';
import { readRegisterForPatch } from '$lib/server/register/readRegisterForPatch';
import { readSectorBuildings, type BuildingReading } from '$lib/server/buildings/readSectorBuildings';
import type { Account } from '$lib/server/accounts/accountRecord';
import type { LocatedRegisterCompany } from '$lib/server/register/registerCompanyRecord';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { PostcodeSector } from './postcodeSectorRecord';
import type { RecordedSectorSearch } from './sectorSearchRecord';
import type { SectorCoverage } from '$lib/data/sectorCoverage';

/** One sector as a person or their Claude reads it: where it stands, who has searched it, and what is registered there. */
export type SectorReading = {
	sector: PostcodeSector;
	coverage: SectorCoverage | null;
	searches: RecordedSectorSearch[];
	companies: LocatedRegisterCompany[];
	buildings: BuildingReading[];
	accounts: Account[];
};

export async function readSector(supabase: SupabaseClient, patch: Patch, sectorName: string): Promise<SectorReading | null> {
	const { sectors, coverage } = await readPatchCoverage(supabase, patch);
	const sector = sectors.find((candidate) => candidate.sector === sectorName);
	if (sector === undefined) return null;
	const [searches, companies, buildings] = await Promise.all([
		listSearchesForSector(supabase, sectorName),
		readRegisterForPatch(supabase, patch.id),
		readSectorBuildings(supabase, patch.id, patch.outcodes, sectorName)
	]);
	const entry = coverage.find((candidate) => candidate.sector === sectorName) ?? null;
	const accountIds = searches.map((search) => search.searchedByAccountId).concat(entry?.claimedByAccountId ?? []);
	return {
		sector,
		coverage: entry,
		searches,
		companies: companies.filter((company) => company.sector === sectorName),
		buildings,
		accounts: await getAccountsById(supabase, accountIds)
	};
}
