import { projectStatusLabels, projectStatusOrder, type ProjectStatus } from './projectStatus';

export type ProjectStatusFilter = ProjectStatus | 'all';

export const everyProjectStatus = 'all';

/** The status tabs as they read: each status in the order work moves through them, then all of them. */
export const projectStatusFilterOrder: ProjectStatusFilter[] = [...projectStatusOrder, everyProjectStatus];

export function projectStatusFilterLabel(filter: ProjectStatusFilter): string {
	if (filter === everyProjectStatus) return 'All';
	return projectStatusLabels[filter];
}

export function matchesProjectStatusFilter(status: ProjectStatus, filter: ProjectStatusFilter): boolean {
	return filter === everyProjectStatus || status === filter;
}
