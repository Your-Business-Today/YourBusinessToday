import { companyDetails } from '$lib/data/companyDetails';

/** The portal's own address. Until it points at the site, no request arrives on it and nothing here changes anything. */
export const portalAddress = {
	hostName: `portal.${companyDetails.websiteHost}`,
	frontPagePath: '/',
	accountPath: '/account'
};

export function isAtPortalAddress(url: URL): boolean {
	return url.hostname === portalAddress.hostName;
}

/** The portal address does not serve the site's front page, so a home that would be the front page is the account instead. */
export function homeInsideThePortal(home: string): string {
	if (home === portalAddress.frontPagePath) return portalAddress.accountPath;
	return home;
}
