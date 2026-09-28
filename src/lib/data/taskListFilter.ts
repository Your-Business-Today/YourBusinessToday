export type TaskListFilter = 'open' | 'all' | 'assigned';

export const taskListFilterLabels: Record<TaskListFilter, string> = {
	open: 'Open',
	all: 'All',
	assigned: 'Assigned to me'
};

export const taskListFilterOrder: TaskListFilter[] = ['open', 'all', 'assigned'];

export const filterWhenTasksOpen: TaskListFilter = 'open';
export const filterForEveryTask: TaskListFilter = 'all';
export const filterForAssignedTasks: TaskListFilter = 'assigned';

export function parseTaskListFilter(value: string | null): TaskListFilter {
	const knownFilter = taskListFilterOrder.find((filter) => filter === value);
	return knownFilter ?? filterWhenTasksOpen;
}

export function taskListHref(filter: TaskListFilter): string {
	if (filter === filterWhenTasksOpen) return '/tasks';
	return `/tasks?status=${filter}`;
}
