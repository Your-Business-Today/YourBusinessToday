import { listPatchesWithCentres } from '$lib/server/patches/listPatchesWithCentres';
import { patchFormActions } from '$lib/server/patches/patchFormActions';
import { describeNearQuery, readNearPoint } from '$lib/data/nearPoint';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { reverseLookupPostcode } from '$lib/server/postcodes/reverseLookupPostcode';
import type { Coordinates } from '$lib/data/distance';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	await requireStaff(locals);
	const near = readNearPoint(url.searchParams);
	const [patches, suggestedPostcode] = await Promise.all([listPatchesWithCentres(locals.supabase), postcodeNear(near)]);
	return { patches, suggestedPostcode, nearQuery: near === null ? '' : describeNearQuery(near) };
};

/** The postcode under a map click prefills the form; postcodes.io being unreachable costs the suggestion, never the page. */
async function postcodeNear(point: Coordinates | null): Promise<string> {
	if (point === null) return '';
	try {
		const location = await reverseLookupPostcode(point);
		return location?.postcode ?? '';
	} catch (failure) {
		console.error('Reverse postcode lookup failed', failure);
		return '';
	}
}

export const actions: Actions = { ...patchFormActions };
