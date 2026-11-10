import type { SupabaseClient } from '@supabase/supabase-js';
import { mapArea, type AreaMap } from '$lib/server/clients/area/mapArea';
import { prospectFormActions } from '$lib/server/clients/prospectFormActions';
import { readAreaSearch, type AreaSearch } from '$lib/data/areaSearch';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { Actions, PageServerLoad } from './$types';

const unknownPostcodeMessage = 'That postcode is not one the Royal Mail knows — check it and try again.';
const mapFailedMessage = 'The area could not be mapped just now — please try again.';

export const load: PageServerLoad = async ({ locals, url }) => {
	await requireStaff(locals);
	const search = readAreaSearch(url.searchParams);
	const outcome = await areaFor(locals.supabase, search);
	return { search, area: outcome.area, notice: outcome.notice };
};

type AreaOutcome = { area: AreaMap | null; notice: string | null };

async function areaFor(supabase: SupabaseClient, search: AreaSearch | null): Promise<AreaOutcome> {
	if (search === null) return { area: null, notice: null };
	try {
		const area = await mapArea(supabase, search);
		if (area === null) return { area: null, notice: unknownPostcodeMessage };
		return { area, notice: null };
	} catch (failure) {
		console.error('Area map failed', failure);
		return { area: null, notice: mapFailedMessage };
	}
}

export const actions: Actions = { ...prospectFormActions };
