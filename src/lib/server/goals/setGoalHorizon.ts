import type { SupabaseClient } from '@supabase/supabase-js';
import { compactGoalRanks } from '$lib/server/ordering/compactInDatabase';
import { getGoal } from '$lib/server/goals/getGoal';
import { nextGoalRank } from '$lib/server/projects/nextRanks';
import { parseGoalHorizon, type GoalHorizon } from '$lib/data/goalHorizon';

export function readGoalHorizon(formData: FormData): GoalHorizon {
	return parseGoalHorizon(formData.get('horizon'));
}

/** Move a goal to the other horizon: it joins the bottom of the goals there, and the gap it left closes. */
export async function setGoalHorizon(
	supabase: SupabaseClient,
	goalId: string,
	horizon: GoalHorizon
): Promise<void> {
	const goal = await getGoal(supabase, goalId);
	if (goal === null || goal.horizon === horizon) return;
	const priority = await nextGoalRank(supabase, goal.projectId, horizon);
	const { error } = await supabase.from('goals').update({ horizon, priority }).eq('id', goalId);
	if (error) throw error;
	await compactGoalRanks(supabase, goal.projectId);
}
