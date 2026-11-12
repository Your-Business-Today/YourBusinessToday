import { areaFor } from '$lib/server/clients/area/areaOutcome';
import { prospectFormActions } from '$lib/server/clients/prospectFormActions';
import { readAreaSearch } from '$lib/data/areaSearch';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	await requireStaff(locals);
	const search = readAreaSearch(url.searchParams);
	const outcome = await areaFor(locals.supabase, search);
	return { search, area: outcome.area, notice: outcome.notice };
};

export const actions: Actions = { ...prospectFormActions };
