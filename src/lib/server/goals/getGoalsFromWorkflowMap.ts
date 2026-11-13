import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { MapStage } from '$lib/data/workflowMap/workflowMap';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A goal raised from a confirmed workflow map, with the version it came from. */
export type GoalFromWorkflowMap = { id: string; projectId: string; title: string; stage: MapStage; versionNumber: number };

/** Every goal on these projects raised from a confirmed workflow map; none before migration 0213. */
export async function getGoalsFromWorkflowMap(
	supabase: SupabaseClient,
	projectIds: string[]
): Promise<GoalFromWorkflowMap[]> {
	if (projectIds.length === 0) return [];
	const { data, error } = await supabase
		.from('goals')
		.select('id, project_id, title, workflow_map_versions!inner(stage, version_number)')
		.in('project_id', projectIds)
		.order('created_at');
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data.map(toGoalFromWorkflowMap);
}

function toGoalFromWorkflowMap(row: Record<string, unknown>): GoalFromWorkflowMap {
	const version = row.workflow_map_versions as Record<string, unknown>;
	return {
		id: String(row.id),
		projectId: String(row.project_id),
		title: String(row.title),
		stage: String(version.stage) as MapStage,
		versionNumber: Number(version.version_number)
	};
}
