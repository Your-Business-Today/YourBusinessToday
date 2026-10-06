import { projectStatusLabels, projectStatusOrder, type ProjectStatus } from './projectStatus';

export type ProjectStatusFilter = ProjectStatus | 'open' | 'all';

export const projectStatusFilters = { open: 'open', all: 'all' } as const;

export const projectStatusFilterOrder: ProjectStatusFilter[] = [
	'open',
	'all',
	...projectStatusOrder
];

export const filterWhenProjectsOpen = projectStatusFilters.open;

const completeProjectStatus: ProjectStatus = 'complete';

export function projectStatusFilterLabel(filter: ProjectStatusFilter): string {
	if (filter === projectStatusFilters.open) return 'Open';
	if (filter === projectStatusFilters.all) return 'All';
	return projectStatusLabels[filter];
}

export function matchesProjectStatusFilter(
	status: ProjectStatus,
	filter: ProjectStatusFilter
): boolean {
	if (filter === projectStatusFilters.all) return true;
	if (filter === projectStatusFilters.open) return status !== completeProjectStatus;
	return status === filter;
}
