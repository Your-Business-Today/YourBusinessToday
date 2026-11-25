import type { SupabaseClient } from '@supabase/supabase-js';
import { designReviewStates } from '$lib/data/designReview';

/** Which of these goals hold a request awaiting YBT: approving it accepts the goal's plan, so nothing under the goal is built till then. */
export async function goalsAwaitingApproval(supabase: SupabaseClient, goalIds: (string | null)[]): Promise<Set<string>> {
	const namedGoalIds = [...new Set(goalIds.filter((goalId): goalId is string => goalId !== null))];
	if (namedGoalIds.length === 0) return new Set();
	const { data, error } = await supabase
		.from('tasks')
		.select('goal_id')
		.in('goal_id', namedGoalIds)
		.eq('design_review_state', designReviewStates.awaiting);
	if (error) throw error;
	return new Set((data ?? []).map((row) => row.goal_id as string));
}
