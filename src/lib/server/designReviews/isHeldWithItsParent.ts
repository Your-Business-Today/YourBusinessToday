import type { SupabaseClient } from '@supabase/supabase-js';
import { isHeldForDesignReview } from '$lib/data/designReview';
import { getTask } from '$lib/server/projects/getTask';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/** A task is held by its own design review, or by its parent's: a chunk of a held feature waits with it. */
export async function isHeldWithItsParent(supabase: SupabaseClient, task: ProjectTask): Promise<boolean> {
	if (isHeldForDesignReview(task)) return true;
	if (task.parentTaskId === null) return false;
	const parent = await getTask(supabase, task.parentTaskId);
	return parent !== null && isHeldForDesignReview(parent);
}
