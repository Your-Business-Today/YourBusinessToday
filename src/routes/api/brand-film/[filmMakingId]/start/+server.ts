import { json } from '@sveltejs/kit';
import { openFilmForRunner } from '$lib/server/brandFilm/openFilmForRunner';
import { requireRunnerKnock } from '$lib/server/brandFilm/requireRunnerKnock';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { RequestHandler } from './$types';

const nothingToFilmStatus = 409;

/** GitHub's runner asks what to film: the order, or why there is nothing to film. */
export const POST: RequestHandler = async ({ params, request }) => {
	const { filmMakingId } = params;
	requireRunnerKnock(request, filmMakingId);
	const opening = await openFilmForRunner(supabaseServiceClient(), filmMakingId);
	if ('problem' in opening) return json(opening, { status: nothingToFilmStatus });
	return json(opening.order);
};
