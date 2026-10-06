import type { SupabaseClient } from '@supabase/supabase-js';
import { findQueuedTask, taskQueue } from '$lib/server/projects/taskQueue';
import { placeBeside } from '$lib/server/ordering/rankedScope';
import { dropPlacements, type DropPlacement } from '$lib/server/ordering/rankedSet';

export async function placeGlobalTask(
	supabase: SupabaseClient,
	movedTaskId: string,
	targetTaskId: string,
	placement: DropPlacement
): Promise<void> {
	if (placement === dropPlacements.inside) return;
	const queued = await findQueuedTask(supabase, movedTaskId);
	if (queued === null) return;
	await placeBeside(taskQueue(supabase, queued.ownerId), queued.task.id, targetTaskId, placement);
}
