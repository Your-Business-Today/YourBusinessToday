import { blueprintViewHref, blueprintViews } from '$lib/components/blueprint/blueprintViews';
import { deepestLinkAt } from '$lib/components/frame/deepestLink';
import { isAtOrUnder } from '$lib/components/frame/framedPaths';
import type { FramePickOption } from '$lib/components/frame/framePicks';
import type { OpenProject } from '$lib/components/frame/frameTrail';
import type { NavigationLink } from '$lib/components/site/siteNavigation';

const boardLabel = 'Board';
const deployHistoryLabel = 'Deployment history';
const deployHistorySegment = 'deploys';
const projectRoute = '/projects/[projectId]';

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
export function projectSwitchOptions(projects: FramePickOption[], openProject: FramePickOption): FramePickOption[] {
	if (projects.some(({ id }) => id === openProject.id)) return projects;
	return [{ id: openProject.id, name: openProject.name }, ...projects];
}

/** The project a page under a project's route has loaded; none on any other page, the client portal's among them. */
export function openProjectOn(routeId: string | null, pageData: { project?: OpenProject }): OpenProject | null {
	const { project } = pageData;
	if (routeId === null || project === undefined || !isAtOrUnder(routeId, projectRoute)) return null;
	return { id: project.id, name: project.name, organisationId: project.organisationId };
}
