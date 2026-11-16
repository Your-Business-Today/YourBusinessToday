import { error, json } from '@sveltejs/kit';
import { getPatch } from '$lib/server/patches/getPatch';
import { getPremises } from '$lib/server/premises/getPremises';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { validatePremisesInPatch } from '$lib/server/premises/validatePremisesInPatch';
import type { RequestHandler } from './$types';

const premisesNotFound = 'That premises could not be found in this territory';

/** The record behind one premises pin, read when the pin is picked: the territory's map carries pins, never every record. */
export const GET: RequestHandler = async ({ locals, params }) => {
	await requireStaff(locals);
	const [patch, premises] = await Promise.all([getPatch(locals.supabase, params.patchId), getPremises(locals.supabase, params.premisesId)]);
	const isOutsideTerritory = patch === null || validatePremisesInPatch(premises, patch) !== null;
	if (isOutsideTerritory) error(404, premisesNotFound);
	return json({ premises });
};
