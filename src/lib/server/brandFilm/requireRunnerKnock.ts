import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { isCronSecretValid } from '$lib/server/watch/isCronSecretValid';
import { isUuid } from '$lib/data/isUuid';

/** Lets in only GitHub's runner, knocking with the cron secret, and only for a request named by a whole id. */
export function requireRunnerKnock(request: Request, filmMakingId: string): void {
	if (!env.CRON_SECRET) error(503, 'filming_not_configured');
	const authorisation = request.headers.get('authorization');
	const isRunner = isCronSecretValid(authorisation, env.CRON_SECRET);
	if (!isRunner) error(401, 'unauthorised');
	if (!isUuid(filmMakingId)) error(404, 'no_such_film');
}
