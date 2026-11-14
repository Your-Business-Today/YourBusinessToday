import { json } from '@sveltejs/kit';
import { closeFilmForRunner } from '$lib/server/brandFilm/closeFilmForRunner';
import { requireRunnerKnock } from '$lib/server/brandFilm/requireRunnerKnock';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { RequestHandler } from './$types';

const notTakenStatus = 409;

/** GitHub's runner says it is done: the video arrived at its link, or why it was not made. */
export const POST: RequestHandler = async ({ params, request }) => {
	const { filmMakingId } = params;
	requireRunnerKnock(request, filmMakingId);
	const given = await request.json().catch(() => null);
	const closing = await closeFilmForRunner(supabaseServiceClient(), filmMakingId, given);
	if ('problem' in closing) return json(closing, { status: notTakenStatus });
	return json(closing);
};
