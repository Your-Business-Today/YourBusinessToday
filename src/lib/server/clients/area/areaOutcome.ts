import type { SupabaseClient } from '@supabase/supabase-js';
import { mapArea, type AreaMap } from './mapArea';
import type { AreaSearch } from '$lib/data/areaSearch';

export const unknownPostcodeMessage = 'That postcode is not one the Royal Mail knows — check it and try again.';
export const mapFailedMessage = 'The area could not be mapped just now — please try again.';

/** The area mapped, or the notice saying why it was not: a postcode nobody knows, or a lookup that failed. */
export type AreaOutcome = { area: AreaMap | null; notice: string | null };

/** The register being unreadable, or a lookup being down, costs the map, never the page or the answer. */
export async function areaFor(supabase: SupabaseClient, search: AreaSearch | null): Promise<AreaOutcome> {
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
