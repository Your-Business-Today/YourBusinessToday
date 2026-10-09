import type { SupabaseClient } from '@supabase/supabase-js';
import { getProjectTasks } from '$lib/server/projects/getProjectTasks';
import { updateTaskColumns } from '$lib/server/projects/taskSiblings';
import { waitsForRefusal } from '$lib/data/taskSequenceStanding';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/**
 * Put a task after the task it must wait for, or let it start whenever. The
 * answer is why it cannot, or null once it is recorded: a task waits for one
 * task on its own project, never itself and never a task that comes after it.
 */
export async function setTaskWaitsFor(
	supabase: SupabaseClient,
	task: ProjectTask,
	waitsForTaskId: string | null
): Promise<string | null> {
	if (task.waitsForTaskId === waitsForTaskId) return null;
	const tasks = await getProjectTasks(supabase, task.projectId);
	const refusal = waitsForRefusal(task, waitsForTaskId, tasks);
	if (refusal !== null) return refusal;
	await updateTaskColumns(supabase, task.id, { waits_for_task_id: waitsForTaskId });
	return null;
}
