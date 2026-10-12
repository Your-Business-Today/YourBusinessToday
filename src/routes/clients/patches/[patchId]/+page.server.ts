import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { accountNameLookup } from '$lib/data/accountNames';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getPatch } from '$lib/server/patches/getPatch';
import { listSearchesForPatch } from '$lib/server/sectors/listSearches';
import { mapPatch, type PatchMap } from '$lib/server/patches/mapPatch';
import { prospectFormActions } from '$lib/server/clients/prospectFormActions';
import { readPatchCoverage, type PatchCoverage } from '$lib/server/sectors/patchCoverage';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { sectorFormActions } from '$lib/server/sectors/sectorFormActions';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { RecordedSectorSearch } from '$lib/server/sectors/sectorSearchRecord';
import type { Actions, PageServerLoad } from './$types';

const mapFailedMessage = 'The patch could not be mapped just now — please try again.';
const nobodyOwnsIt = 'nobody';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireStaff(locals);
	const patch = await getPatch(locals.supabase, params.patchId);
	if (patch === null) error(404, 'That patch could not be found');
	const [outcome, coverage, searches] = await Promise.all([
		mapOf(locals.supabase, patch),
		readPatchCoverage(locals.supabase, patch),
		listSearchesForPatch(locals.supabase, patch.id)
	]);
	const accountNames = await namesOf(locals.supabase, patch, coverage, searches);
	const ownerName = patch.ownerAccountId === null ? nobodyOwnsIt : accountNames[patch.ownerAccountId];
	return { patch, ownerName, map: outcome.map, notice: outcome.notice, coverage, searches, accountNames };
};

/** Everyone the page names: the owner, every claimant and every searcher, looked up once. */
async function namesOf(
	supabase: SupabaseClient,
	patch: Patch,
	coverage: PatchCoverage,
	searches: RecordedSectorSearch[]
): Promise<Record<string, string>> {
	const ids = [
		...(patch.ownerAccountId === null ? [] : [patch.ownerAccountId]),
		...coverage.coverage.flatMap((entry) => (entry.claimedByAccountId === null ? [] : [entry.claimedByAccountId])),
		...searches.map((search) => search.searchedByAccountId)
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

export const actions: Actions = { ...prospectFormActions, ...sectorFormActions };
