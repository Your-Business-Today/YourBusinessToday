const topLevelScope =
	'of all the project’s top level tasks, counting done ones and those under every goal';
const subtaskScope = 'of the subtasks, counting done ones';

/** What a task's priority number ranks it among, as the priority field says it. */
export function taskPriorityScope(parentTaskId: string | null): string {
	return parentTaskId === null ? topLevelScope : subtaskScope;
}
