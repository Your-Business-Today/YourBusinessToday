import {
	accountLinksFor,
	adminLink,
	canSeeOrganisations,
	clientsLink,
	leadsLink,
	organisationsLink,
	projectsLink,
	type NavigationAccess,
	type NavigationLink
} from '$lib/components/site/siteNavigation';
import {
	portalBillingPath,
	portalConnectPath,
	portalContextPath,
	portalHomePath,
	portalPeoplePath
} from '$lib/portal/portalPaths';
import type { FrameLink } from './frameGroups';

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
	{ href: portalBillingPath, label: 'Billing' },
	{ href: portalConnectPath, label: 'Connect your Claude' }
];

const portalPeopleLink: NavigationLink = { href: portalPeoplePath, label: 'People' };

const workProjectsLink: FrameLink = { ...projectsLink, group: 'work' };

const salesRegisterLinks: FrameLink[] = [
	{ ...leadsLink, group: 'sales' },
	{ ...clientsLink, group: 'sales' }
];

/** The side bar's links beyond the picked organisation's own: work inside an organisation, and nothing above one. */
export function frameLinksFor(access: FrameAccess): FrameLink[] {
	if (access.isPortalAccount) return portalLinksFor(access.isPortalAdministrator);
	const { isStaff } = siteAccessOf(access);
	if (!isStaff) return [workProjectsLink];
	return [workProjectsLink, ...salesRegisterLinks];
}

/** The top-right menu's links: what sits above any one organisation, and the person's own account. */
export function frameMenuLinksFor(access: FrameAccess): NavigationLink[] {
	if (access.isPortalAccount) return [];
	const siteAccess = siteAccessOf(access);
	const organisationLinks = canSeeOrganisations(siteAccess) ? [organisationsLink] : [];
	const adminLinks = siteAccess.isAdmin ? [adminLink] : [];
	return [...organisationLinks, ...adminLinks, ...accountLinksFor(siteAccess)];
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
