import type { SupabaseClient } from '@supabase/supabase-js';
import { briefCompaniesPerRun, briefSectorsPerRun } from '$lib/data/observationRules';
import { filterRegisterCompanies } from '$lib/server/register/filterRegisterCompanies';
import { listObservationsForPatch } from './listObservations';
import { readPatchCoverage, unsearchedFirst } from '$lib/server/sectors/patchCoverage';
import { readRegisterForPatch } from '$lib/server/register/readRegisterForPatch';
import type { LocatedRegisterCompany } from '$lib/server/register/registerCompanyRecord';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { SectorCoverage } from '$lib/data/sectorCoverage';

/** What a weekly sweep looks at: the sectors most in need of a visit, then a page of companies longest unobserved. */
export type PatchBrief = {
	sectorsToWork: SectorCoverage[];
	companies: (LocatedRegisterCompany & { lastObservedAt: string | null })[];
	nextCursor: number | null;
};

const everyKind = { sicCode: '', status: '', incorporatedSince: '', arrivedSince: '', shouldIncludeHubs: false, shouldIncludeNonTrading: false };

export async function readPatchBrief(supabase: SupabaseClient, patch: Patch, cursor: number): Promise<PatchBrief> {
	const [coverage, register, observations] = await Promise.all([
		readPatchCoverage(supabase, patch),
		readRegisterForPatch(supabase, patch.id),
		listObservationsForPatch(supabase, patch.id)
	]);
	const lastObservedAt = new Map<string, string>();
	for (const observation of observations) {
		if (!lastObservedAt.has(observation.companyNumber)) lastObservedAt.set(observation.companyNumber, observation.observedAt);
	}
	const trading = filterRegisterCompanies(register, everyKind)
		.map((company) => ({ ...company, lastObservedAt: lastObservedAt.get(company.companyNumber) ?? null }))
		.sort(byLongestUnobserved);
	const page = trading.slice(cursor, cursor + briefCompaniesPerRun);
	const nextCursor = cursor + briefCompaniesPerRun < trading.length ? cursor + briefCompaniesPerRun : null;
	return { sectorsToWork: unsearchedFirst(coverage.coverage).slice(0, briefSectorsPerRun), companies: page, nextCursor };
}

function byLongestUnobserved(first: { lastObservedAt: string | null }, second: { lastObservedAt: string | null }): number {
	const firstTime = first.lastObservedAt === null ? 0 : new Date(first.lastObservedAt).getTime();
	const secondTime = second.lastObservedAt === null ? 0 : new Date(second.lastObservedAt).getTime();
	return firstTime - secondTime;
}
