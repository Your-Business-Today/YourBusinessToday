import { projectStatusFilterOrder, type ProjectStatusFilter } from './projectStatusFilter';
import type { ProjectStatus } from './projectStatus';

/** The Projects tab that lists the tasks waiting on the viewer; every other tab is a status of the projects. */
export const priorityTasksTab = 'priority_tasks';

export const projectsTabCookie = 'projects_tab';

const scoping: ProjectStatus = 'scoping';
const building: ProjectStatus = 'building';
const yearInSeconds = 60 * 60 * 24 * 365;

/** The status filter a tab stands for, or null for Priority tasks and for anything that is no tab. */
export function statusFilterOfTab(tab: string | null): ProjectStatusFilter | null {
	return projectStatusFilterOrder.find((status) => status === tab) ?? null;
}

/** The tab a person last had the page on, as their browser sends it back; null when it names no tab. */
export function rememberedProjectsTab(cookieValue: string | undefined): string | null {
	if (cookieValue === priorityTasksTab) return priorityTasksTab;
	return statusFilterOfTab(cookieValue ?? null);
}

/** A cookie rather than the browser's own storage, so the server draws the page already on the tab. */
export function cookieRememberingTab(tab: string): string {
	return `${projectsTabCookie}=${tab}; path=/projects; max-age=${yearInSeconds}; samesite=lax`;
}

/** Where the page opens with nothing remembered: Building when it holds more projects than Scoping, else Scoping. */
export function statusOnFirstVisit(projects: { status: ProjectStatus }[]): ProjectStatus {
	const countOf = (status: ProjectStatus) => projects.filter((project) => project.status === status).length;
	return countOf(building) > countOf(scoping) ? building : scoping;
}
