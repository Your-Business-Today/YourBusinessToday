import { error } from '@sveltejs/kit';
import type { SupabaseClient } from '@supabase/supabase-js';
import { accountNameLookup } from '$lib/data/accountNames';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getPatch } from '$lib/server/patches/getPatch';
import { mapArea, type AreaMap } from '$lib/server/clients/area/mapArea';
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
	const [ownerName, outcome] = await Promise.all([ownerNameOf(locals.supabase, patch), areaOf(locals.supabase, patch)]);
	return { patch, ownerName, area: outcome.area, notice: outcome.notice };
};

async function ownerNameOf(supabase: SupabaseClient, patch: Patch): Promise<string> {
	if (patch.ownerAccountId === null) return nobodyOwnsIt;
	const owners = await getAccountsById(supabase, [patch.ownerAccountId]);
	return accountNameLookup(owners)(patch.ownerAccountId);
}

type AreaOutcome = { area: AreaMap | null; notice: string | null };

/** The patch's own search, drawn as the area map draws it; the services being down cost the map, never the page. */
async function areaOf(supabase: SupabaseClient, patch: Patch): Promise<AreaOutcome> {
	const search = { postcode: patch.centrePostcode, radiusMiles: patch.radiusMiles, sicCodes: patch.sicCodes };
	try {
		const area = await mapArea(supabase, search);
		return { area, notice: area === null ? mapFailedMessage : null };
	} catch (failure) {
		console.error('Patch map failed', failure);
		return { area: null, notice: mapFailedMessage };
	}
}

export const actions: Actions = { ...prospectFormActions };
