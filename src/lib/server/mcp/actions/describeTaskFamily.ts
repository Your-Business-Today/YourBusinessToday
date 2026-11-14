import { taskStatusLabelFor } from '$lib/data/taskKind';
import type { FamilyTask } from '$lib/data/taskDeletion';

type TaskFamilyShown = { parentTask: FamilyTask | null; subtasks: FamilyTask[] };

/** Where a task sits in its tree: the task it is a subtask of, and the subtasks under it with where each stands. */
export function taskFamilyLines({ parentTask, subtasks }: TaskFamilyShown): string[] {
	return [...parentLines(parentTask), ...subtaskLines(subtasks)];
}

/** One task in a list of a task's subtasks: its title, where it stands and its id. */
export function subtaskLine(subtask: FamilyTask): string {
	const status = taskStatusLabelFor(subtask.kind, subtask.status);
	return `- "${subtask.title}" (${status}, task id: ${subtask.id})`;
}

function parentLines(parentTask: FamilyTask | null): string[] {
	if (parentTask === null) return [];
	return [`Subtask of: "${parentTask.title}" (task id: ${parentTask.id})`];
}

function subtaskLines(subtasks: FamilyTask[]): string[] {
	if (subtasks.length === 0) return ['Subtasks: none.'];
	return ['Subtasks:', ...subtasks.map(subtaskLine)];
}
