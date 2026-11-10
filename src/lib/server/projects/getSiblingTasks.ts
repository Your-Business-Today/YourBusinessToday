import type { SupabaseClient } from '@supabase/supabase-js';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import { siblingsOf } from '$lib/server/projects/taskSiblings';

export async function getSiblingTasks(
	supabase: SupabaseClient,
	task: ProjectTask
): Promise<ProjectTask[]> {
	const siblings = await siblingsOf(supabase, task).load();
	return siblings.filter((siblingTask) => siblingTask.id !== task.id);
}
