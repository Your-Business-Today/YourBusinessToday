import { matchesOrganisationFilter, type OrganisationFilter } from './organisationFilter';
import { matchesProjectStatusFilter, type ProjectStatusFilter } from './projectStatusFilter';
import type { OrganisationPlace } from './organisationAccess';
import type { ProjectStatus } from './projectStatus';

/** What the projects page is narrowed to: a status, an organisation, and words from the name. */
export type ProjectListFilters = {
	status: ProjectStatusFilter;
	organisation: OrganisationFilter;
	searchText: string;
};

type FilterableProject = { name: string; status: ProjectStatus; organisationId: string | null };

export function matchesProjectListFilters(
	project: FilterableProject,
	filters: ProjectListFilters,
	organisations: OrganisationPlace[]
): boolean {
	const matchesStatus = matchesProjectStatusFilter(project.status, filters.status);
	const matchesOrganisation = matchesOrganisationFilter(project.organisationId, filters.organisation, organisations);
	const matchesSearch = project.name.toLowerCase().includes(filters.searchText.trim().toLowerCase());
	return matchesStatus && matchesOrganisation && matchesSearch;
}
