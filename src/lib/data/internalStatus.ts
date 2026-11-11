import type { TaskStatus } from './taskStatus';
import type { TodoStatus } from './todo';

/** Where an internal item stands, in monday.com's words, mapped onto the statuses every task already has. */
export const internalStatusLabels: Record<TaskStatus, string> = {
	backlog: 'Not started',
	in_progress: 'Working on it',
	on_hold: 'Stuck',
	done: 'Done'
};

/** A to-do in the same words. A to-do has no Stuck: it is done or it is not. */
export const todoStatusWords: Record<TodoStatus, string> = {
	to_do: internalStatusLabels.backlog,
	doing: internalStatusLabels.in_progress,
	done: internalStatusLabels.done
};
