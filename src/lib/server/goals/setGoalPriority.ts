import type { SupabaseClient } from '@supabase/supabase-js';
import { getGoal } from '$lib/server/goals/getGoal';
import { goalOrder } from '$lib/server/goals/goalOrder';
import { setRank } from '$lib/server/ordering/rankedScope';

/** Put a goal at a rank among the goals on its horizon; the others shift to make room. */
export async function setGoalPriority(
	supabase: SupabaseClient,
	goalId: string,
	priority: number
): Promise<void> {
	const goal = await getGoal(supabase, goalId);
	if (goal === null || goal.priority === priority) return;
	await setRank(goalOrder(supabase, goal.projectId, goal.horizon), goal.id, priority);
}
