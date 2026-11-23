import { readStored, writeStored } from '$lib/client/browserStorage';

/** What each browser says when a page's code was taken away by a newer deploy before the page could load it. */
const missingBuildFileMessages = [
	'Failed to fetch dynamically imported module',
	'error loading dynamically imported module',
	'Importing a module script failed',
	'Unable to preload CSS'
];
const reloadedPageKey = 'stale-build-reloaded-page';

export function isMissingBuildFile(message: string): boolean {
	return missingBuildFileMessages.some((missingMessage) => message.includes(missingMessage));
}

/**
 * A page served by one deploy and run after the next cannot load its own code, and would show the error page
 * in place of the page it was. Loading it again fetches the page and its code from the same deploy. Once per
 * page per visit, so a file that is truly missing shows the error rather than reloading forever.
 */
export function reloadOnceForStaleBuild(error: unknown): boolean {
	const message = error instanceof Error ? error.message : String(error);
	if (!isMissingBuildFile(message)) return false;
	const { pathname, search } = window.location;
	const page = `${pathname}${search}`;
	const hasReloadedPage = readStored('visit', reloadedPageKey, '') === page;
	if (hasReloadedPage) return false;
	writeStored('visit', reloadedPageKey, page);
	window.location.reload();
	return true;
}
