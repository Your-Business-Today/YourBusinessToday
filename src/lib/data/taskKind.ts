import type { TaskStatus } from './taskStatus';
import { taskStatusLabels } from './taskStatus';

export type TaskKind = 'work' | 'support';

export const supportTaskKind: TaskKind = 'support';

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
	if (value === 'support') return 'support';
	return 'work';
}

export function taskStatusLabelFor(kind: TaskKind, status: TaskStatus): string {
	if (kind === 'support') return supportTaskStatusLabels[status];
	return taskStatusLabels[status];
}

export function isAwaitingAnswer(kind: TaskKind, status: TaskStatus): boolean {
	return kind === 'support' && status === 'backlog';
}
