import type { SupabaseClient } from '@supabase/supabase-js';
import { accountNameLookup } from '$lib/data/accountNames';
import { readCachedLocations } from '$lib/server/postcodes/postcodeLocationCache';
import { getAccountsById } from '$lib/server/accounts/getAccountsById';
import { listPatches } from './listPatches';
import type { Coordinates } from '$lib/data/distance';
import type { Patch } from './patchRecord';

export type PatchWithCentre = Patch & { centre: Coordinates | null; ownerName: string };

const nobodyOwnsIt = 'Nobody';

/** Every live patch with where its centre is on the ground and who works it: what the overview map draws. Centres come from the cache alone, filled as each patch was saved. */
export async function listPatchesWithCentres(supabase: SupabaseClient): Promise<PatchWithCentre[]> {
	const patches = await listPatches(supabase);
	const ownerIds = patches.flatMap((patch) => (patch.ownerAccountId === null ? [] : [patch.ownerAccountId]));
	const [locations, owners] = await Promise.all([
		readCachedLocations(supabase, patches.map((patch) => patch.centrePostcode)),
		getAccountsById(supabase, ownerIds)
	]);
	const located = new Map(locations.map((location) => [location.postcode, location]));
	const nameOf = accountNameLookup(owners);
	return patches.map((patch) => ({
		...patch,
		centre: located.get(patch.centrePostcode) ?? null,
		ownerName: patch.ownerAccountId === null ? nobodyOwnsIt : nameOf(patch.ownerAccountId)
	}));
}
