import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { accountNameLookup } from '$lib/data/accountNames';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getPatch } from '$lib/server/patches/getPatch';
import { mapPatch, type PatchMap } from '$lib/server/patches/mapPatch';
import { prospectFormActions } from '$lib/server/clients/prospectFormActions';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { Patch } from '$lib/server/patches/patchRecord';
import type { Actions, PageServerLoad } from './$types';

const mapFailedMessage = 'The patch could not be mapped just now — please try again.';
const nobodyOwnsIt = 'nobody';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireStaff(locals);
	const patch = await getPatch(locals.supabase, params.patchId);
	if (patch === null) error(404, 'That patch could not be found');
	const [ownerName, outcome] = await Promise.all([ownerNameOf(locals.supabase, patch), mapOf(locals.supabase, patch)]);
	return { patch, ownerName, map: outcome.map, notice: outcome.notice };
};

async function ownerNameOf(supabase: SupabaseClient, patch: Patch): Promise<string> {
	if (patch.ownerAccountId === null) return nobodyOwnsIt;
	const owners = await getAccountsById(supabase, [patch.ownerAccountId]);
	return accountNameLookup(owners)(patch.ownerAccountId);
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

export const actions: Actions = { ...prospectFormActions };
