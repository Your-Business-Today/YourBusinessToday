import { matchesProjectStatusFilter, projectStatusFilters } from './projectStatusFilter';
import { projectStatusLabels, projectStatusOrder, type ProjectStatus } from './projectStatus';

/** What an organisation's Projects tab is narrowed to: the active ones, every one, or one status. */
export type OrganisationProjectFilter = typeof activeProjectsFilter | typeof projectStatusFilters.all | ProjectStatus;

export const activeProjectsFilter = 'active';

export const organisationProjectFilterOrder: OrganisationProjectFilter[] = [
	activeProjectsFilter,
	projectStatusFilters.all,
	...projectStatusOrder
];

/** Statuses of a project nobody is working on: finished, or put down for now. */
const inactiveStatuses: ProjectStatus[] = ['complete', 'on_hold'];

export function organisationProjectFilterLabel(filter: OrganisationProjectFilter): string {
	if (filter === activeProjectsFilter) return 'Active';
	if (filter === projectStatusFilters.all) return 'All';
	return projectStatusLabels[filter];
}

export function matchesOrganisationProjectFilter(status: ProjectStatus, filter: OrganisationProjectFilter): boolean {
	if (filter === activeProjectsFilter) return !inactiveStatuses.includes(status);
	return matchesProjectStatusFilter(status, filter);
}
