import type { ProjectStatus } from './projectStatus';

/** Statuses a project rests in once its building is over. */
const restingStatuses: ProjectStatus[] = ['maintenance', 'complete'];

export type ProjectAtRest = { status: ProjectStatus; openTaskCount: number };

/** A project with nothing left to do: resting in maintenance or complete, with no open task. */
export function isFinishedProject(project: ProjectAtRest): boolean {
	const isResting = restingStatuses.includes(project.status);
	const hasNoOpenTask = project.openTaskCount === 0;
	return isResting && hasNoOpenTask;
}
