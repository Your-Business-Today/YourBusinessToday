import { isPublicPage } from '$lib/data/publicPages';

/** Signing in and out, setting a password, and the doors that are not pages: what an account reaches before it accepts the terms, beside the public site. */
const openPaths = new Set<string>(['/account', '/account/set-password']);
const openPrefixes = ['/auth/', '/api/'];

/** The public site stays open to everyone, so only using the site itself waits on the terms. */
export function isOpenBeforeAcceptingTerms(pathname: string): boolean {
	if (isPublicPage(pathname)) return true;
	if (openPaths.has(pathname)) return true;
	return openPrefixes.some((prefix) => pathname.startsWith(prefix));
}
