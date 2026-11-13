import type { SupabaseClient } from '@supabase/supabase-js';
import { nextGoalRank } from '$lib/server/projects/nextRanks';
import { parseGoalHorizon, type GoalHorizon } from '$lib/data/goalHorizon';
import { parseDepartment, type Department } from '$lib/data/department';
import { departmentColumns } from '$lib/server/departments/departmentColumns';

export type NewGoalSeed = {
	title: string;
	measure: string;
	horizon: GoalHorizon;
	department?: Department;
	workflowMapVersionId?: string;
};

export function readNewGoalSeed(formData: FormData): NewGoalSeed | null {
	const title = String(formData.get('title') ?? '').trim();
	if (title === '') return null;
	return {
		title,
		measure: String(formData.get('measure') ?? '').trim(),
		horizon: parseGoalHorizon(formData.get('horizon')),
		department: parseDepartment(formData.get('department')) ?? undefined
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
			created_by: createdBy,
			...departmentColumns(seed.department),
			...workflowMapVersionColumns(seed.workflowMapVersionId)
		})
		.select('id')
		.single();
	if (error) throw error;
	return data.id;
}

/** The confirmed workflow map a service goal came from; a goal raised any other way writes nothing, as before migration 0213. */
function workflowMapVersionColumns(workflowMapVersionId: string | undefined): Record<string, string> {
	if (workflowMapVersionId === undefined) return {};
	return { workflow_map_version_id: workflowMapVersionId };
}
