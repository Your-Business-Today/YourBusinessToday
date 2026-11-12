import { matchesProjectListFilters, type FilterableProject, type ProjectListFilters } from './projectListFilter';
import { projectStatusFilterOrder, type ProjectStatusFilter } from './projectStatusFilter';

/** How many projects each status tab would show, with the search and the finished choice as they stand. */
export function countByStatusFilter(
	projects: FilterableProject[],
	filters: ProjectListFilters
): Map<ProjectStatusFilter, number> {
	return new Map(
		projectStatusFilterOrder.map((status) => {
			const matching = projects.filter((project) => matchesProjectListFilters(project, { ...filters, status }));
			return [status, matching.length];
		})
	);
}
