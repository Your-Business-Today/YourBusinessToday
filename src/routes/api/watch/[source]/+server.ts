import { error, json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { isCronSecretValid } from '$lib/server/watch/isCronSecretValid';
import { runWatchSource } from '$lib/server/watch/runWatchSource';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { validateWatchSourceName } from '$lib/server/watch/watchSources';
import { WatchCheckFailure } from '$lib/server/watch/watchCheckFailure';
import type { WatchSource } from '$lib/server/watch/watchSource';
import type { RequestHandler } from './$types';

const longestRunSeconds = 300;
const checkFailedStatus = 500;

export const config = { maxDuration: longestRunSeconds };

/** Vercel's cron runner knocks here on its schedule; the named watcher runs on the service client and reports where it got to. */
export const GET: RequestHandler = async ({ params, request }) => {
	if (!env.CRON_SECRET) error(503, 'watch_not_configured');
	const authorisation = request.headers.get('authorization');
	const isCronRunner = isCronSecretValid(authorisation, env.CRON_SECRET);
	if (!isCronRunner) error(401, 'unauthorised');
	const source = validateWatchSourceName(params.source);
	if (source === null) error(404, 'unknown_source');
	return runAndAnswer(source);
};

/** A check that found something wanting answers with its finding, so the knock that asked for it can show it. */
async function runAndAnswer(source: WatchSource): Promise<Response> {
	try {
		return json(await runWatchSource(supabaseServiceClient(), source));
	} catch (failure) {
		if (!(failure instanceof WatchCheckFailure)) throw failure;
		return json({ source: source.name, note: failure.message, isFinished: false }, { status: checkFailedStatus });
	}
}
