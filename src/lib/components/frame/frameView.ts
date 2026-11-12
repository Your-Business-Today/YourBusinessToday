import { frameLinksFor, frameMenuLinksFor, type FrameAccess } from './frameNavigation';
import { salesPages } from '$lib/data/salesPages';
import { deepestLinkAt } from './deepestLink';
import { frameSectionsOf, type FrameLink, type FrameSection } from './frameGroups';
import { frameTrailTo, type FrameTrail, type OpenProject } from './frameTrail';
import { portalHomePath } from '$lib/portal/portalPaths';
import type { FramePicks } from './framePicks';
import type { NavigationLink } from '$lib/components/site/siteNavigation';

/**
 * What the frame shows round one page: the side bar's links and the folders they sit in, the top-right menu's
 * links, the one the page sits under, and the top bar's trail.
 */
export type FrameView = {
	links: NavigationLink[];
	sections: FrameSection[];
	menuLinks: NavigationLink[];
	currentHref: string | null;
	trail: FrameTrail;
	homePath: string;
	signOutPath: string;
};

const siteHomePath = '/';
const siteSignOutPath = '/account?/signOut';
const portalSignOutPath = `${portalHomePath}?/signOut`;
const notificationsHeading: NavigationLink = { href: '/notifications', label: 'Notifications' };

/** The picked organisation's own pages and modules come first, then the work inside it, each once; what sits above an organisation is the menu's. */
export function frameViewFor(
	access: FrameAccess,
	url: URL,
	picks: FramePicks | null,
	openProject: OpenProject | null = null
): FrameView {
	const { pathname } = url;
	const pickedLinks = picks === null ? [] : [...picks.organisationLinks, ...picks.moduleLinks];
	const links = eachHrefOnce([...pickedLinks, ...frameLinksFor(access)]);
	const menuLinks = frameMenuLinksFor(access);
	const headingsOutsideTheSideBar = [...menuLinks, ...salesPages, notificationsHeading];
	const currentLink = deepestLinkAt([...links, ...headingsOutsideTheSideBar], pathname);
	return {
		links,
		sections: frameSectionsOf(links),
		menuLinks,
		currentHref: currentLink?.href ?? null,
		trail: frameTrailTo(currentLink, picks, openProject),
		homePath: picks?.homePath ?? defaultHomePathFor(access),
		signOutPath: access.isPortalAccount ? portalSignOutPath : siteSignOutPath
	};
}

function defaultHomePathFor(access: FrameAccess): string {
	return access.isPortalAccount ? portalHomePath : siteHomePath;
}

function eachHrefOnce(links: FrameLink[]): FrameLink[] {
	return links.filter((link, index) => links.findIndex(({ href }) => href === link.href) === index);
}
