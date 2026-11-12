import { companyDetails } from '$lib/data/companyDetails';
import { portalAddress } from './portalAddress';

const mainSiteHostNames = new Set([companyDetails.websiteHost, `www.${companyDetails.websiteHost}`]);
const pathSeparator = '/';

/** The signed-in sections of the site, the first part of their path; the main site sends each to the portal. */
export const sectionsServedOnlyAtThePortal = new Set([
	'account',
	'admin',
	'clients',
	'leaderboard',
	'leads',
	'notifications',
	'organisations',
	'people',
	'portal',
	'projects'
]);

export function isAtMainSiteAddress(url: URL): boolean {
	return mainSiteHostNames.has(url.hostname);
}

/** The same path and query on the portal, for a signed-in page asked for at the main site; null for anything the main site serves itself. */
export function portalPageInsteadOf(url: URL): string | null {
	if (!isAtMainSiteAddress(url)) return null;
	const [section] = url.pathname.split(pathSeparator).filter(Boolean);
	if (!sectionsServedOnlyAtThePortal.has(section)) return null;
	return `${portalAddress.origin}${url.pathname}${url.search}`;
}

/** Where a link to a signed-in page should point: the portal, seen from the main site; the address itself on a preview or the portal. */
export function signedInOriginSeenFrom(url: URL): string {
	if (isAtMainSiteAddress(url)) return portalAddress.origin;
	return url.origin;
}
