import {
	accountLinksFor,
	businessLinksFor,
	workLinksFor,
	type NavigationAccess,
	type NavigationLink
} from '$lib/components/site/siteNavigation';
import {
	portalConnectPath,
	portalContextPath,
	portalHomePath,
	portalPeoplePath
} from '$lib/portal/portalPaths';

/** What a signed-in person may open, as the site's layout reads it. */
export type FrameAccess = {
	isStaff: boolean;
	isAdmin: boolean;
	hasOrganisations: boolean;
	isPortalAccount: boolean;
	isPortalAdministrator: boolean;
};

const portalLinks: NavigationLink[] = [
	{ href: portalHomePath, label: 'Your projects' },
	{ href: portalContextPath, label: 'Your company context' },
	{ href: portalConnectPath, label: 'Connect your Claude' }
];

const portalPeopleLink: NavigationLink = { href: portalPeoplePath, label: 'People' };

/** The side bar's links: the same ones each person reaches today, and no others. */
export function frameLinksFor(access: FrameAccess): NavigationLink[] {
	if (access.isPortalAccount) return portalLinksFor(access.isPortalAdministrator);
	const siteAccess = siteAccessOf(access);
	const businessLinks = siteAccess.isStaff ? businessLinksFor(siteAccess) : [];
	return [...workLinksFor(siteAccess), ...businessLinks, ...accountLinksFor(siteAccess)];
}

function portalLinksFor(isPortalAdministrator: boolean): NavigationLink[] {
	if (!isPortalAdministrator) return portalLinks;
	return [...portalLinks, portalPeopleLink];
}

function siteAccessOf(access: FrameAccess): NavigationAccess {
	return {
		isSignedIn: true,
		isStaff: access.isStaff || access.isAdmin,
		isAdmin: access.isAdmin,
		hasOrganisations: access.hasOrganisations
	};
}
