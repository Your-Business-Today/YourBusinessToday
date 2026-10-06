import type { SupabaseClient } from '@supabase/supabase-js';
import { siblingsOf } from '$lib/server/projects/taskSiblings';
import { getTask } from '$lib/server/projects/getTask';
import { setRank } from '$lib/server/ordering/rankedScope';

/** Put a task at a rank among the tasks beside it; the others shift to make room. */
export async function setTaskPriority(
	supabase: SupabaseClient,
	taskId: string,
	priority: number
): Promise<void> {
	const task = await getTask(supabase, taskId);
	if (task === null || task.priority === priority) return;
	await setRank(siblingsOf(supabase, task), task.id, priority);
}
