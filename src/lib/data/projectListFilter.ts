import { isFinishedProject, type ProjectAtRest } from './finishedProject';
import { matchesProjectStatusFilter, type ProjectStatusFilter } from './projectStatusFilter';

/** What the projects page is narrowed to: a status, words from the name, and whether finished projects show. */
export type ProjectListFilters = {
	status: ProjectStatusFilter;
	searchText: string;
	isShowingFinished: boolean;
};

export type FilterableProject = ProjectAtRest & { name: string };

export function matchesProjectListFilters(project: FilterableProject, filters: ProjectListFilters): boolean {
	const matchesStatus = matchesProjectStatusFilter(project.status, filters.status);
	const matchesSearch = project.name.toLowerCase().includes(filters.searchText.trim().toLowerCase());
	const isShown = filters.isShowingFinished || !isFinishedProject(project);
	return matchesStatus && matchesSearch && isShown;
}
