export type TaskStatus = 'backlog' | 'in_progress' | 'on_hold' | 'done';

export const taskStatuses = {
	backlog: 'backlog',
	inProgress: 'in_progress',
	onHold: 'on_hold',
	done: 'done'
} as const;

export const taskStatusLabels: Record<TaskStatus, string> = {
	backlog: 'Backlog',
	in_progress: 'In progress',
	on_hold: 'On hold',
	done: 'Done'
};

export const taskStatusOrder: TaskStatus[] = ['backlog', 'in_progress', 'on_hold', 'done'];

export const doneTaskStatus = taskStatuses.done;

export const inProgressTaskStatus = taskStatuses.inProgress;

export function parseTaskStatus(value: unknown): TaskStatus {
	const status = taskStatusOrder.find((candidate) => candidate === value);
	return status ?? taskStatuses.backlog;
}

export function isTaskDone(status: TaskStatus): boolean {
	return status === doneTaskStatus;
}
