import {
	accountLinksFor,
	adminLink,
	canSeeOrganisations,
	clientsLink,
	leadsLink,
	leaderboardLink,
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
	portalPeoplePath,
	portalWorkflowMapPath
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

const portalLinks: FrameLink[] = [
	{ href: portalHomePath, label: 'Your projects', icon: 'folderKanban' },
	{ href: portalWorkflowMapPath, label: 'Your workflow map', icon: 'route' },
	{ href: portalContextPath, label: 'Your company context', icon: 'fileText' },
	{ href: portalBillingPath, label: 'Billing', icon: 'creditCard' },
	{ href: portalConnectPath, label: 'Connect your Claude', icon: 'plug' }
];

const portalPeopleLink: FrameLink = { href: portalPeoplePath, label: 'People', icon: 'users' };

const workProjectsLink: FrameLink = { ...projectsLink, icon: 'folderKanban', group: 'work' };

const salesRegisterLinks: FrameLink[] = [
	{ ...leadsLink, icon: 'target', group: 'sales' },
	{ ...clientsLink, icon: 'building', group: 'sales' },
	{ ...leaderboardLink, icon: 'trophy', group: 'sales' }
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

function portalLinksFor(isPortalAdministrator: boolean): FrameLink[] {
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
