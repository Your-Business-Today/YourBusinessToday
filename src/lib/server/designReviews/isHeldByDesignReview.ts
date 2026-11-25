import type { SupabaseClient } from '@supabase/supabase-js';
import { isHeldForDesignReview } from '$lib/data/designReview';
import { getTask } from '$lib/server/projects/getTask';
import { goalsAwaitingApproval } from './goalsAwaitingApproval';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/**
 * A task is held by its own design review, by its parent's, or by its goal's: a chunk of a held feature waits
 * with it, and so does every task of a goal whose plan holds a request, so nothing is half built before YBT decides.
 */
export async function isHeldByDesignReview(supabase: SupabaseClient, task: ProjectTask): Promise<boolean> {
	if (isHeldForDesignReview(task)) return true;
	const heldGoalIds = await goalsAwaitingApproval(supabase, [task.goalId]);
	if (task.goalId !== null && heldGoalIds.has(task.goalId)) return true;
	if (task.parentTaskId === null) return false;
	const parent = await getTask(supabase, task.parentTaskId);
	return parent !== null && isHeldForDesignReview(parent);
}
