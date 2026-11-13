import { developmentSideDepartments } from '$lib/data/internalProject';
import type { Department } from '$lib/data/department';

/**
 * The tasks a project's open count and progress are made of. A product counts its Development side alone, since the
 * team's administration, sales and marketing jobs live on the organisation's Tasks page; an internal project has
 * nothing but those jobs, so it counts them all.
 */
export function countedWork<Task extends { department: Department }>(isInternal: boolean, tasks: Task[]): Task[] {
	if (isInternal) return tasks;
	return tasks.filter((task) => developmentSideDepartments.includes(task.department));
}
