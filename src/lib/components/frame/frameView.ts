import { frameLinksFor, type FrameAccess } from './frameNavigation';
import { deepestLinkAt } from './deepestLink';
import { portalHomePath } from '$lib/portal/portalPaths';
import type { FramePicks } from './framePicks';
import type { NavigationLink } from '$lib/components/site/siteNavigation';

/** What the frame shows round one page: the side bar's links, the one the page sits under, and the top bar's heading. */
export type FrameView = {
	links: NavigationLink[];
	currentHref: string | null;
	heading: string;
	homePath: string;
	signOutPath: string;
};

const siteHomePath = '/';
const siteSignOutPath = '/account?/signOut';
const portalSignOutPath = `${portalHomePath}?/signOut`;
const fallbackHeading = 'Your Business Today';
const headingsOutsideTheSideBar: NavigationLink[] = [
	{ href: '/notifications', label: 'Notifications' }
];

/** The picked organisation's own pages and modules come first, then the links each person reaches today, each once. */
export function frameViewFor(access: FrameAccess, url: URL, picks: FramePicks | null): FrameView {
	const { pathname } = url;
	const pickedLinks = picks === null ? [] : [...picks.organisationLinks, ...picks.moduleLinks];
	const links = eachHrefOnce([...pickedLinks, ...frameLinksFor(access)]);
	const currentLink = deepestLinkAt([...links, ...headingsOutsideTheSideBar], pathname);
	return {
		links,
		currentHref: currentLink?.href ?? null,
		heading: currentLink?.label ?? fallbackHeading,
		homePath: picks?.homePath ?? defaultHomePathFor(access),
		signOutPath: access.isPortalAccount ? portalSignOutPath : siteSignOutPath
	};
}

function defaultHomePathFor(access: FrameAccess): string {
	return access.isPortalAccount ? portalHomePath : siteHomePath;
}

function eachHrefOnce(links: NavigationLink[]): NavigationLink[] {
	return links.filter((link, index) => links.findIndex(({ href }) => href === link.href) === index);
}
