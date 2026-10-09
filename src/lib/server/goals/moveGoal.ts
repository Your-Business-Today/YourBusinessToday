import type { SupabaseClient } from '@supabase/supabase-js';
import { getGoal } from '$lib/server/goals/getGoal';
import { goalOrder } from '$lib/server/goals/goalOrder';
import { moveByOne } from '$lib/server/ordering/rankedScope';
import type { MoveDirection } from '$lib/server/ordering/rankedSet';

export async function moveGoal(
	supabase: SupabaseClient,
	goalId: string,
	direction: MoveDirection
): Promise<void> {
	const goal = await getGoal(supabase, goalId);
	if (goal === null) return;
	await moveByOne(goalOrder(supabase, goal.projectId, goal.horizon), goal.id, direction);
}
