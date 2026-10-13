import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { accountNameLookup } from '$lib/data/accountNames';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getPatch } from '$lib/server/patches/getPatch';
import { listSearchesForPatch } from '$lib/server/sectors/listSearches';
import { listSightingsForPatch } from '$lib/server/sightings/listSightings';
import { mapPatch, type PatchMap } from '$lib/server/patches/mapPatch';
import { patchLeadFormActions } from '$lib/server/patches/patchLeadFormActions';
import { premisesFormActions } from '$lib/server/premises/premisesFormActions';
import { prospectFormActions } from '$lib/server/clients/prospectFormActions';
import { readPatchCoverage, type PatchCoverage } from '$lib/server/sectors/patchCoverage';
import { readBuildingCountsBySector } from '$lib/server/buildings/buildingCounts';
import { readWatcherTimes } from '$lib/server/watch/readWatcherTimes';
import { jobAdvertFormActions } from '$lib/server/jobAdverts/jobAdvertFormActions';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { sectorFormActions } from '$lib/server/sectors/sectorFormActions';
import { sightingFormActions } from '$lib/server/sightings/sightingFormActions';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { RecordedSectorSearch } from '$lib/server/sectors/sectorSearchRecord';
import type { Sighting } from '$lib/server/sightings/sightingRecord';
import type { Actions, PageServerLoad } from './$types';

const mapFailedMessage = 'The patch could not be mapped just now — please try again.';
const nobodyOwnsIt = 'nobody';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireStaff(locals);
	const patch = await getPatch(locals.supabase, params.patchId);
	if (patch === null) error(404, 'That patch could not be found');
	const [outcome, coverage, searches, sightings, watchers, buildingCounts] = await Promise.all([
		mapOf(locals.supabase, patch),
		readPatchCoverage(locals.supabase, patch),
		listSearchesForPatch(locals.supabase, patch.id),
		listSightingsForPatch(locals.supabase, patch.outcodes),
		readWatcherTimes(locals.supabase),
		readBuildingCountsBySector(locals.supabase, patch.id)
	]);
	const accountNames = await namesOf(locals.supabase, patch, coverage, searches, sightings);
	const ownerName = patch.ownerAccountId === null ? nobodyOwnsIt : accountNames[patch.ownerAccountId];
	return { patch, ownerName, map: outcome.map, notice: outcome.notice, coverage, searches, sightings, accountNames, watchers, buildingCounts };
};

/** Everyone the page names: the owner, every claimant, every searcher and every finder, looked up once. */
async function namesOf(
	supabase: SupabaseClient,
	patch: Patch,
	coverage: PatchCoverage,
	searches: RecordedSectorSearch[],
	sightings: Sighting[]
): Promise<Record<string, string>> {
	const ids = [
		...(patch.ownerAccountId === null ? [] : [patch.ownerAccountId]),
		...coverage.coverage.flatMap((entry) => (entry.claimedByAccountId === null ? [] : [entry.claimedByAccountId])),
		...searches.map((search) => search.searchedByAccountId),
		...sightings.map((sighting) => sighting.seenByAccountId)
	];
	const accounts = await getAccountsById(supabase, ids);
	const nameOf = accountNameLookup(accounts);
	return Object.fromEntries(ids.map((id) => [id, nameOf(id)]));
}

type MapOutcome = { map: PatchMap | null; notice: string | null };

/** The register being unreadable, or its migration unrun, costs the map, never the page. */
async function mapOf(supabase: SupabaseClient, patch: Patch): Promise<MapOutcome> {
	try {
		const map = await mapPatch(supabase, patch);
		return { map, notice: map === null ? mapFailedMessage : null };
	} catch (failure) {
		console.error('Patch map failed', failure);
		return { map: null, notice: mapFailedMessage };
	}
}

export const actions: Actions = {
	...prospectFormActions,
	...patchLeadFormActions,
	...premisesFormActions,
	...sectorFormActions,
	...sightingFormActions,
	...jobAdvertFormActions
};
