import { error } from '@sveltejs/kit';
import { accountNameLookup } from '$lib/data/accountNames';
import { getPatch } from '$lib/server/patches/getPatch';
import { readSector } from '$lib/server/sectors/readSector';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { sectorFormActions } from '$lib/server/sectors/sectorFormActions';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	await requireStaff(locals);
	const patch = await getPatch(locals.supabase, params.patchId);
	if (patch === null) error(404, 'That patch could not be found');
	const reading = await readSector(locals.supabase, patch, params.sector.toUpperCase());
	if (reading === null || reading.coverage === null) error(404, 'That sector is not in this patch');
	const nameOf = accountNameLookup(reading.accounts);
	const accountNames = Object.fromEntries(reading.accounts.map((account) => [account.id, nameOf(account.id)]));
	return { patch, reading, coverage: reading.coverage, accountNames };
};

export const actions: Actions = { ...sectorFormActions };
