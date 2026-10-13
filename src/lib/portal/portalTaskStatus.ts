import { taskKinds, taskStatusLabelFor, type TaskKind } from '$lib/data/taskKind';
import type { TaskStatus } from '$lib/data/taskStatus';

const workStatusLabelsForClients: Record<TaskStatus, string> = {
	backlog: 'Planned',
	in_progress: 'In progress',
	on_hold: 'On hold',
	done: 'Done'
};

/** A task's state as a client reads it: work waiting its turn is planned, not in a backlog. */
export function portalTaskStatusLabel(kind: TaskKind, status: TaskStatus): string {
	if (kind === taskKinds.work) return workStatusLabelsForClients[status];
	return taskStatusLabelFor(kind, status);
}
