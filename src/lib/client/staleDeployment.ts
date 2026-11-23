import { readStored, writeStored, type StorageArea } from './browserStorage';

/** What each browser says when a script the page asks for is no longer on the server. */
const missingScriptMessages = [
	'Failed to fetch dynamically imported module',
	'error loading dynamically imported module',
	'Importing a module script failed'
];

const reloadedPageKey = 'reloadedForFreshCode';
const visit: StorageArea = 'visit';

/**
 * A page saved before a deploy asks for scripts the deploy took away. Search engines render pages
 * they saved hours or days earlier, so this is how a working page came to be indexed as an error.
 */
export function isFromAnEarlierDeploy(error: unknown): boolean {
	if (!(error instanceof Error)) return false;
	const { message } = error;
	return missingScriptMessages.some((missingScript) => message.includes(missingScript));
}

/** Loads the page afresh, with the scripts of the deploy now live, once per page in a visit, so a page that still fails shows its error rather than reloading for ever. */
export function reloadOnceForFreshCode(): boolean {
	const pageAddress = location.href;
	const hasReloadedAlready = readStored(visit, reloadedPageKey, null) === pageAddress;
	if (hasReloadedAlready) return false;
	writeStored(visit, reloadedPageKey, pageAddress);
	const isRemembered = readStored(visit, reloadedPageKey, null) === pageAddress;
	if (!isRemembered) return false;
	location.reload();
	return true;
}
