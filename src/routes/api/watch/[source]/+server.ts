import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { isCronSecretValid } from '$lib/server/watch/isCronSecretValid';
import { runWatchSource } from '$lib/server/watch/runWatchSource';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { validateWatchSourceName } from '$lib/server/watch/watchSources';
import type { RequestHandler } from './$types';

const longestRunSeconds = 300;

export const config = { maxDuration: longestRunSeconds };

/** Vercel's cron runner knocks here on its schedule; the named watcher runs on the service client and reports where it got to. */
export const GET: RequestHandler = async ({ params, request }) => {
	if (!env.CRON_SECRET) error(503, 'watch_not_configured');
	const authorisation = request.headers.get('authorization');
	const isCronRunner = isCronSecretValid(authorisation, env.CRON_SECRET);
	if (!isCronRunner) error(401, 'unauthorised');
	const source = validateWatchSourceName(params.source);
	if (source === null) error(404, 'unknown_source');
	return json(await runWatchSource(supabaseServiceClient(), source));
};
