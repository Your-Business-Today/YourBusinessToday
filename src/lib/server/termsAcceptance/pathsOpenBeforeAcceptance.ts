import { termsAddresses } from '$lib/data/termsVersion';
import { homePagePath, publicPagePaths } from '$lib/data/publicPages';
import { isAtOrUnder } from '$lib/components/frame/framedPaths';

/**
 * The public site, the terms and what they link to, signing in and out, and the doors that are not pages:
 * all an account may reach before it accepts the terms. Only using the site waits for them.
 */
const openPaths = new Set<string>([
	termsAddresses.accept,
	termsAddresses.skills,
	'/account',
	'/account/set-password'
]);
const openPrefixes = ['/auth/', '/api/'];
const publicSections = publicPagePaths.filter((path) => path !== homePagePath);

export function isOpenBeforeAcceptingTerms(pathname: string): boolean {
	if (pathname === homePagePath || openPaths.has(pathname)) return true;
	const isPublicPage = publicSections.some((sectionPath) => isAtOrUnder(pathname, sectionPath));
	if (isPublicPage) return true;
	return openPrefixes.some((prefix) => pathname.startsWith(prefix));
}
