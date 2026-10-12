import type { SupabaseClient } from '@supabase/supabase-js';
import { byMostNeeded, countCoverage, coverageStateOf, type CoverageCounts, type SectorCoverage } from '$lib/data/sectorCoverage';
import { listClaimsForPatch } from './listClaims';
import { listSearchesForPatch } from './listSearches';
import { listSectorsForPatch } from './listSectorsForPatch';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { PostcodeSector } from './postcodeSectorRecord';

export type PatchCoverage = { sectors: PostcodeSector[]; coverage: SectorCoverage[]; counts: CoverageCounts };

/** Every sector of the patch with what a person last did in it, derived fresh from the searches and the claims. */
export async function readPatchCoverage(supabase: SupabaseClient, patch: Patch): Promise<PatchCoverage> {
	const [sectors, searches, claims] = await Promise.all([
		listSectorsForPatch(supabase, patch),
		listSearchesForPatch(supabase, patch.id),
		listClaimsForPatch(supabase, patch.id)
	]);
	const latestBySector = new Map<string, string>();
	const countBySector = new Map<string, number>();
	for (const search of searches) {
		if (!latestBySector.has(search.sector)) latestBySector.set(search.sector, search.searchedAt);
		countBySector.set(search.sector, (countBySector.get(search.sector) ?? 0) + 1);
	}
	const claimantBySector = new Map(claims.map((claim) => [claim.sector, claim.claimedByAccountId]));
	const today = new Date();
	const coverage = sectors.map((sector) => coverageOf(sector.sector, latestBySector, countBySector, claimantBySector, today));
	return { sectors, coverage, counts: countCoverage(coverage) };
}

function coverageOf(
	sector: string,
	latestBySector: Map<string, string>,
	countBySector: Map<string, number>,
	claimantBySector: Map<string, string>,
	today: Date
): SectorCoverage {
	const latestSearchedAt = latestBySector.get(sector) ?? null;
	const claimedByAccountId = claimantBySector.get(sector) ?? null;
	return {
		sector,
		state: coverageStateOf(latestSearchedAt, claimedByAccountId, today),
		latestSearchedAt,
		searchCount: countBySector.get(sector) ?? 0,
		claimedByAccountId
	};
}

/** The sectors still to be worked, the most needed first. */
export function unsearchedFirst(coverage: SectorCoverage[]): SectorCoverage[] {
	return coverage.filter((entry) => entry.state !== 'searched').sort(byMostNeeded);
}
