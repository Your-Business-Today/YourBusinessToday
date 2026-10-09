import type { SupabaseClient } from '@supabase/supabase-js';
import { doneTaskStatus, type TaskStatus } from '$lib/data/taskStatus';

const fullyComplete = 100;

/**
 * Move a task to a status, recording who moved it so the feed can say so.
 * A merged pull request moves it with nobody signed in: pass null.
 */
export async function updateTaskStatus(
	supabase: SupabaseClient,
	taskId: string,
	status: TaskStatus,
	movedBy: string | null
): Promise<void> {
	const completion = status === doneTaskStatus ? { completion_percent: fullyComplete } : {};
	const { error } = await supabase
		.from('tasks')
		.update({ status, status_set_by: movedBy, ...completion })
		.eq('id', taskId);
	if (error) throw error;
}
