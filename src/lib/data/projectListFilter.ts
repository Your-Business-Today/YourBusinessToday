import { isFinishedProject, type ProjectAtRest } from './finishedProject';
import { matchesOrganisationFilter, type OrganisationFilter } from './organisationFilter';
import { matchesProjectStatusFilter, type ProjectStatusFilter } from './projectStatusFilter';
import type { OrganisationPlace } from './organisationAccess';

/** What the projects page is narrowed to: a status, an organisation, words from the name, and whether finished projects show. */
export type ProjectListFilters = {
	status: ProjectStatusFilter;
	organisation: OrganisationFilter;
	searchText: string;
	isShowingFinished: boolean;
};

type FilterableProject = ProjectAtRest & { name: string; organisationId: string | null };

export function matchesProjectListFilters(
	project: FilterableProject,
	filters: ProjectListFilters,
	organisations: OrganisationPlace[]
): boolean {
	const matchesStatus = matchesProjectStatusFilter(project.status, filters.status);
	const matchesOrganisation = matchesOrganisationFilter(project.organisationId, filters.organisation, organisations);
	const matchesSearch = project.name.toLowerCase().includes(filters.searchText.trim().toLowerCase());
	const isShown = filters.isShowingFinished || !isFinishedProject(project);
	return matchesStatus && matchesOrganisation && matchesSearch && isShown;
}
