import { isTaskDone } from '$lib/data/taskStatus';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/** The tasks a new task beside these could wait for: the ones not yet done. */
export function openSiblingsOf<Task extends ProjectTask>(siblings: Task[]): Task[] {
	return siblings.filter((sibling) => !isTaskDone(sibling.status));
}
