import { boardSideLabels, boardSideOfTab, boardSides } from '$lib/data/boardSide';
import { boardTabs, parseBoardTab } from '$lib/data/boardTab';
import { isAtOrUnder } from '$lib/components/frame/framedPaths';
import { boardQueryKeys, projectHref, projectSegments } from './projectAddresses';
import type { FramePickOption } from '$lib/components/frame/framePicks';
import type { OpenProject } from '$lib/components/frame/frameTrail';

/** The top tabs of a product: building it, the team's own jobs on it, and its part of the organisation's workflow map. */
export type ProjectPage = 'development' | 'task-management' | 'workflow-map';

export const projectPages = { development: 'development', taskManagement: 'task-management', workflowMap: 'workflow-map' } as const;

export type ProjectPageLink = { key: ProjectPage; label: string; href: string };

const projectRoute = '/projects/[projectId]';
const workflowMapLabel = 'Workflow map';
const taskManagementQuery = `?${boardQueryKeys.department}=${boardTabs.administration}`;
const tabPageSegments = ['', ...Object.values(projectSegments)];

/**
 * A product's top tabs: Development, holding its backlog, board, deploys and site map, and its Workflow map, the stations
 * of its organisation's map it runs. The team's own jobs sit on the organisation's Tasks page, so only a product under no
 * organisation keeps a Task Management tab. An internal project is not a product, so it has Task Management alone.
 */
export function projectPageLinks(projectId: string, isInternalProject = false, isUnderOrganisation = false): ProjectPageLink[] {
	const boardHref = projectHref(projectId);
	const taskManagement = { key: projectPages.taskManagement, label: boardSideLabels.internal, href: `${boardHref}${taskManagementQuery}` };
	if (isInternalProject) return [taskManagement];
	const development = { key: projectPages.development, label: boardSideLabels.development, href: boardHref };
	const workflowMapHref = projectHref(projectId, projectSegments.workflowMap);
	const workflowMap = { key: projectPages.workflowMap, label: workflowMapLabel, href: workflowMapHref };
	if (isUnderOrganisation) return [development, workflowMap];
	return [development, taskManagement, workflowMap];
}

/** The top tab a page sits under: Workflow map for the map, Task Management for the team's jobs, Development for the rest. */
export function currentProjectPage(projectId: string, address: URL): ProjectPage {
	const workflowMapHref = projectHref(projectId, projectSegments.workflowMap);
	if (isAtOrUnder(address.pathname, workflowMapHref)) return projectPages.workflowMap;
	const namedTab = parseBoardTab(address.searchParams.get(boardQueryKeys.department));
	const isTeamWork = namedTab !== null && boardSideOfTab(namedTab) === boardSides.internal;
	if (address.pathname === projectHref(projectId) && isTeamWork) return projectPages.taskManagement;
	return projectPages.development;
}

/** Switching project keeps the same tab, and lands on the board from a task or a goal. The board keeps its side and view. */
export function samePageInProject(projectId: string, address: URL, switchedToId: string): string {
	const segment = address.pathname.slice(projectHref(projectId).length).replace(/^\//, '');
	if (!tabPageSegments.includes(segment)) return projectHref(switchedToId);
	if (segment === '') return `${projectHref(switchedToId)}${address.search}`;
	return projectHref(switchedToId, segment);
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
