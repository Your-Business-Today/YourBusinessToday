import { blueprintViewHref, blueprintViews } from '$lib/components/blueprint/blueprintViews';
import { deepestLinkAt } from '$lib/components/frame/deepestLink';
import type { FramePickOption } from '$lib/components/frame/framePicks';
import type { NavigationLink } from '$lib/components/site/siteNavigation';

const boardLabel = 'Board';
const deployHistoryLabel = 'Deployment history';
const deployHistorySegment = 'deploys';
const unnamedProject = 'This project';

/** A project's pages as the tabs under its name: its board first, then its domain, site map and deploys. */
export function projectPageLinks(projectId: string): NavigationLink[] {
	const boardLink = { href: `/projects/${projectId}`, label: boardLabel };
	const blueprintLinks = blueprintViews.map(({ label, path }) => ({ href: blueprintViewHref(projectId, path), label }));
	const deployHistoryLink = { href: `${boardLink.href}/${deployHistorySegment}`, label: deployHistoryLabel };
	return [boardLink, ...blueprintLinks, deployHistoryLink];
}

/** The tab the page sits under: the board for a task or a goal opened from it. */
export function currentProjectPage(projectId: string, pathname: string): NavigationLink | undefined {
	return deepestLinkAt(projectPageLinks(projectId), pathname);
}

/** Switching project keeps the same tab, and lands on the board from a task or a goal. */
export function samePageInProject(projectId: string, pathname: string, switchedToId: string): string {
	const tabIndex = projectPageLinks(projectId).findIndex(({ href }) => href === pathname);
	const switchedToLinks = projectPageLinks(switchedToId);
	return (switchedToLinks[tabIndex] ?? switchedToLinks[0]).href;
}

/** The organisation's projects to switch between, with the open one among them even when it sits elsewhere. */
export function projectSwitchOptions(
	projects: FramePickOption[],
	projectId: string,
	projectName: string | null
): FramePickOption[] {
	if (projects.some(({ id }) => id === projectId)) return projects;
	return [{ id: projectId, name: projectName ?? unnamedProject }, ...projects];
}
