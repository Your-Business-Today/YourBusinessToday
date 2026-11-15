import { areaFor } from '$lib/server/clients/area/areaOutcome';
import { prospectFormActions } from '$lib/server/clients/prospectFormActions';
import { readAreaSearch } from '$lib/data/areaSearch';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { Actions, PageServerLoad } from './$types';

/** A wide radius searches dozens of outcodes and places thousands of companies, which takes longer than a page usually may. */
const longestMapSeconds = 300;

export const config = { maxDuration: longestMapSeconds };

export const load: PageServerLoad = async ({ locals, url }) => {
	await requireStaff(locals);
	const search = readAreaSearch(url.searchParams);
	const outcome = await areaFor(locals.supabase, search);
	return { search, area: outcome.area, notice: outcome.notice };
};

export const actions: Actions = { ...prospectFormActions };
