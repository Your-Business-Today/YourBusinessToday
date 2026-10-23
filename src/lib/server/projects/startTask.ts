import type { SupabaseClient } from '@supabase/supabase-js';
import { inProgressTaskStatus, taskStatuses } from '$lib/data/taskStatus';

/**
 * Move a task from the backlog to In progress because work on it has begun. A task on hold or
 * done is left where someone put it, so starting twice changes nothing.
 */
export async function startTask(
	supabase: SupabaseClient,
	taskId: string,
	startedBy: string | null
): Promise<void> {
	const { error } = await supabase
		.from('tasks')
		.update({ status: inProgressTaskStatus, status_set_by: startedBy })
		.eq('id', taskId)
		.eq('status', taskStatuses.backlog);
	if (error) throw error;
}
