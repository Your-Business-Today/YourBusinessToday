import type { SupabaseClient } from '@supabase/supabase-js';
import { getGoal } from '$lib/server/goals/getGoal';
import { goalOrder } from '$lib/server/goals/goalOrder';
import { placeBeside } from '$lib/server/ordering/rankedScope';
import { dropPlacements, type DropPlacement } from '$lib/server/ordering/rankedSet';

export async function placeGoal(
	supabase: SupabaseClient,
	movedGoalId: string,
	targetGoalId: string,
	placement: DropPlacement
): Promise<void> {
	if (placement === dropPlacements.inside) return;
	const movedGoal = await getGoal(supabase, movedGoalId);
	if (movedGoal === null) return;
	await placeBeside(goalOrder(supabase, movedGoal.projectId), movedGoal.id, targetGoalId, placement);
}
