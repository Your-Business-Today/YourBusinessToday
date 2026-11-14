import type { SupabaseClient } from '@supabase/supabase-js';
import { getDescendantsOfTask } from './getDescendantsOfTask';
import { planTaskDeletion, type TaskDeletionPlan } from '$lib/data/taskDeletion';
import type { ProjectTask } from './taskRecord';

/** What deleting the task would do to the subtasks under it, as they stand now. */
export async function getTaskDeletionPlan(
	supabase: SupabaseClient,
	task: ProjectTask
): Promise<TaskDeletionPlan<ProjectTask>> {
	return planTaskDeletion(task, await getDescendantsOfTask(supabase, task.id));
}
