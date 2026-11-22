import { termsAddresses } from '$lib/data/termsVersion';

/** The terms and what they link to, signing in and out, and the doors that are not pages: all an account may reach before it accepts the terms. */
const openPaths = new Set<string>([
	termsAddresses.terms,
	termsAddresses.accept,
	termsAddresses.skills,
	'/privacy',
	'/account',
	'/account/sign-in',
	'/account/set-password'
]);
const openPrefixes = ['/auth/', '/api/'];

export function isOpenBeforeAcceptingTerms(pathname: string): boolean {
	if (openPaths.has(pathname)) return true;
	return openPrefixes.some((prefix) => pathname.startsWith(prefix));
}
