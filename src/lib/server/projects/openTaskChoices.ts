import { isTaskDone } from '$lib/data/taskStatus';
import type { ProjectTask } from './taskRecord';

export type TaskChoice = { id: string; title: string };

export function openTaskChoices(tasks: ProjectTask[]): TaskChoice[] {
	const openTasks = tasks.filter((task) => !isTaskDone(task.status));
	return openTasks.map((task) => ({ id: task.id, title: task.title }));
}
