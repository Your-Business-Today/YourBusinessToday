import { companyDetails } from '$lib/data/companyDetails';

const portalHostName = `portal.${companyDetails.websiteHost}`;

/** The portal's own address, where sign-in and every signed-in page live. */
export const portalAddress = {
	hostName: portalHostName,
	origin: `https://${portalHostName}`,
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
