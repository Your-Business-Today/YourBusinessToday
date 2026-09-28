export type TaskStatus = 'backlog' | 'in_progress' | 'on_hold' | 'done';

export const taskStatusLabels: Record<TaskStatus, string> = {
	backlog: 'Backlog',
	in_progress: 'In progress',
	on_hold: 'On hold',
	done: 'Done'
};

export const taskStatusOrder: TaskStatus[] = ['backlog', 'in_progress', 'on_hold', 'done'];

export const doneTaskStatus: TaskStatus = 'done';

export function parseTaskStatus(value: unknown): TaskStatus {
	if (value === 'in_progress' || value === 'on_hold' || value === 'done') return value;
	return 'backlog';
}

export function isTaskDone(status: TaskStatus): boolean {
	return status === doneTaskStatus;
}
