import { error, json } from '@sveltejs/kit';
import { listBuildingsInBounds } from '$lib/server/buildings/listBuildingsInBounds';
import { readMapBounds, validateMapBounds, mapBoundsRefusal } from '$lib/data/mapBounds';
import { requireStaff } from '$lib/server/auth/requireStaff';
import type { RequestHandler } from './$types';

/** The footprints inside the view the map asks for, once it is zoomed in far enough to draw them. */
export const GET: RequestHandler = async ({ locals, params, url }) => {
	await requireStaff(locals);
	const bounds = readMapBounds(url.searchParams);
	if (bounds === null) error(400, mapBoundsRefusal);
	const refusal = validateMapBounds(bounds);
	if (refusal !== null) error(400, refusal);
	return json({ buildings: await listBuildingsInBounds(locals.supabase, params.patchId, bounds) });
};
