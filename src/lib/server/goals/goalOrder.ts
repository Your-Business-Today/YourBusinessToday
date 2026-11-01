import type { SupabaseClient } from '@supabase/supabase-js';
import { parseGoalRecord, type Goal } from '$lib/server/goals/goalRecord';
import { rankChanges } from '$lib/server/ordering/rankChanges';
import { rankColumnsOf, saveRanks } from '$lib/server/ordering/saveRanks';
import type { GoalHorizon } from '$lib/data/goalHorizon';
import type { RankedScope } from '$lib/server/ordering/rankedScope';

/** The goals on one horizon of a project, ranked by `priority`. */
export function goalOrder(
	supabase: SupabaseClient,
	projectId: string,
	horizon: GoalHorizon
): RankedScope<Goal> {
	return {
		load: () => loadGoals(supabase, projectId, horizon),
		readRank: (goal) => goal.priority,
		save: (goalsInOrder) => saveGoalOrder(supabase, goalsInOrder)
	};
}

async function loadGoals(
	supabase: SupabaseClient,
	projectId: string,
	horizon: GoalHorizon
): Promise<Goal[]> {
	const { data, error } = await supabase
		.from('goals')
		.select('*')
		.eq('project_id', projectId)
		.eq('horizon', horizon)
		.order('priority', { ascending: true })
		.order('created_at', { ascending: true });
	if (error) throw error;
	return data.map(parseGoalRecord);
}

async function saveGoalOrder(supabase: SupabaseClient, goalsInOrder: Goal[]): Promise<void> {
	const changes = rankColumnsOf(rankChanges(goalsInOrder, (goal) => goal.priority));
	await saveRanks(supabase, 'save_goal_ranks', { goal_ids: changes.ids, ranks: changes.ranks });
}
