/** The contact page, signing in and out, and the legal pages: all an account waiting to be let in may reach. */
export const awaitingAccessPage = '/contact';

const openPaths = new Set([
	awaitingAccessPage,
	'/account',
	'/account/sign-in',
	'/account/set-password',
	'/privacy',
	'/terms',
]);
const openPrefixes = ['/auth/'];

export function isOpenWhileAwaitingAccess(pathname: string): boolean {
	if (openPaths.has(pathname)) return true;
	return openPrefixes.some((prefix) => pathname.startsWith(prefix));
}
