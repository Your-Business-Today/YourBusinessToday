import { isTaskDone } from '$lib/data/taskStatus';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

export function withoutDoneTasks(taskTree: TaskTreeNode[]): TaskTreeNode[] {
	return tasksKeptWhere(taskTree, (task) => !isTaskDone(task.status));
}

/**
 * The tasks that are kept. A task left out never takes its kept subtasks with
 * it: they rise into its place, so filtering out a container cannot hide the
 * open work inside it.
 */
export function tasksKeptWhere(
	taskTree: TaskTreeNode[],
	isKept: (task: TaskTreeNode) => boolean
): TaskTreeNode[] {
	return taskTree.flatMap((task) => {
		const keptSubtasks = tasksKeptWhere(task.subtasks, isKept);
		if (!isKept(task)) return keptSubtasks;
		return [{ ...task, subtasks: keptSubtasks }];
	});
}

/** The tasks that match, with the parents that lead to a matching subtask. */
export function onlyTasksWhere(
	taskTree: TaskTreeNode[],
	isWanted: (task: TaskTreeNode) => boolean
): TaskTreeNode[] {
	return taskTree.flatMap((task) => {
		const subtasks = onlyTasksWhere(task.subtasks, isWanted);
		if (!isWanted(task) && subtasks.length === 0) return [];
		return [{ ...task, subtasks }];
	});
}

export function countTasksWhere(
	taskTree: TaskTreeNode[],
	isWanted: (task: TaskTreeNode) => boolean
): number {
	return taskTree.reduce(
		(count, task) => count + (isWanted(task) ? 1 : 0) + countTasksWhere(task.subtasks, isWanted),
		0
	);
}
