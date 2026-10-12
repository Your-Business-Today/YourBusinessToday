import { error } from '@sveltejs/kit';
import { accountNameLookup } from '$lib/data/accountNames';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { getPatch } from '$lib/server/patches/getPatch';
import { listSightingsForPatch } from '$lib/server/sightings/listSightings';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireStaff(locals);
	const patch = await getPatch(locals.supabase, params.patchId);
	if (patch === null) error(404, 'That patch could not be found');
	const sightings = await listSightingsForPatch(locals.supabase, patch.outcodes);
	const finders = await getAccountsById(locals.supabase, sightings.map((sighting) => sighting.seenByAccountId));
	const nameOf = accountNameLookup(finders);
	const accountNames = Object.fromEntries(sightings.map((sighting) => [sighting.seenByAccountId, nameOf(sighting.seenByAccountId)]));
	return { patch, sightings, accountNames };
};
