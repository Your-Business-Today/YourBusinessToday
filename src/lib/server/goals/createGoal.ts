import type { SupabaseClient } from '@supabase/supabase-js';
import { nextGoalRank } from '$lib/server/projects/nextRanks';
import { parseGoalHorizon, type GoalHorizon } from '$lib/data/goalHorizon';

export type NewGoalSeed = {
	title: string;
	measure: string;
	horizon: GoalHorizon;
};

export function readNewGoalSeed(formData: FormData): NewGoalSeed | null {
	const title = String(formData.get('title') ?? '').trim();
	if (title === '') return null;
	return {
		title,
		measure: String(formData.get('measure') ?? '').trim(),
		horizon: parseGoalHorizon(formData.get('horizon'))
	};
}

export async function createGoal(
	supabase: SupabaseClient,
	projectId: string,
	seed: NewGoalSeed,
	createdBy: string
): Promise<string> {
	const { data, error } = await supabase
		.from('goals')
		.insert({
			project_id: projectId,
			title: seed.title,
			measure: seed.measure,
			horizon: seed.horizon,
			priority: await nextGoalRank(supabase, projectId, seed.horizon),
			created_by: createdBy
		})
		.select('id')
		.single();
	if (error) throw error;
	return data.id;
}
