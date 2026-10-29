export type ProjectStatus =
	| 'scoping'
	| 'building'
	| 'testing'
	| 'maintenance'
	| 'complete'
	| 'on_hold';

export const projectStatusLabels: Record<ProjectStatus, string> = {
	scoping: 'Scoping',
	building: 'Building',
	testing: 'Testing',
	maintenance: 'Maintenance',
	complete: 'Complete',
	on_hold: 'On hold'
};

export const projectStatusOrder: ProjectStatus[] = [
	'scoping',
	'building',
	'testing',
	'maintenance',
	'complete',
	'on_hold'
];

export const onHoldProjectStatus: ProjectStatus = 'on_hold';

const statusForNewProject: ProjectStatus = 'scoping';

export function parseProjectStatus(value: unknown): ProjectStatus {
	const knownStatus = projectStatusOrder.find((status) => status === value);
	return knownStatus ?? statusForNewProject;
}

export function isProjectStatus(value: unknown): value is ProjectStatus {
	return projectStatusOrder.some((status) => status === value);
}
