import type { SupabaseClient } from '@supabase/supabase-js';
import { findQueuedTask, taskQueue } from '$lib/server/projects/taskQueue';
import { setRank } from '$lib/server/ordering/rankedScope';

/** Put a top level task at a position in its owner's queue across every project. */
export async function setQueuePriority(
	supabase: SupabaseClient,
	taskId: string,
	position: number
): Promise<void> {
	const queued = await findQueuedTask(supabase, taskId);
	if (queued === null) return;
	const { task, ownerId } = queued;
	if (task.globalPriority === position) return;
	await setRank(taskQueue(supabase, ownerId), task.id, position);
}
