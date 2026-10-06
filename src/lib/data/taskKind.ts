import type { TaskStatus } from './taskStatus';
import { taskStatuses, taskStatusLabels } from './taskStatus';

export type TaskKind = 'work' | 'support';

export const taskKinds = { work: 'work', support: 'support' } as const;

export const supportTaskKind = taskKinds.support;

export const taskKindOrder: TaskKind[] = ['work', 'support'];

export const taskKindLabels: Record<TaskKind, string> = {
	work: 'Work',
	support: 'Support'
};

const supportTaskStatusLabels: Record<TaskStatus, string> = {
	backlog: 'Awaiting answer',
	in_progress: 'Being looked at',
	on_hold: 'On hold',
	done: 'Resolved'
};

export function parseTaskKind(value: unknown): TaskKind {
	if (value === taskKinds.support) return taskKinds.support;
	return taskKinds.work;
}

export function taskStatusLabelFor(kind: TaskKind, status: TaskStatus): string {
	if (kind === taskKinds.support) return supportTaskStatusLabels[status];
	return taskStatusLabels[status];
}

export function isAwaitingAnswer(kind: TaskKind, status: TaskStatus): boolean {
	return kind === taskKinds.support && status === taskStatuses.backlog;
}
