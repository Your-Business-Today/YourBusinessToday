import { getTask } from '$lib/server/projects/getTask';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { SupabaseClient } from '@supabase/supabase-js';

export const taskOnProjectRequired = 'A task on this project is required.';

/** The task a form names by its taskId, when that task is on the given project. */
export async function findTaskOnProject(
	supabase: SupabaseClient,
	formData: FormData,
	projectId: string
): Promise<ProjectTask | null> {
	const task = await getTask(supabase, String(formData.get('taskId') ?? ''));
	if (task === null || task.projectId !== projectId) return null;
	return task;
}
