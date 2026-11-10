import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A goal raised from a confirmed company context, with the version it came from. */
export type GoalFromContext = { id: string; projectId: string; title: string; contextVersionNumber: number };

/** Every goal on these projects raised from a confirmed context; none before migration 0171. */
export async function getGoalsRaisedFromContext(
	supabase: SupabaseClient,
	projectIds: string[]
): Promise<GoalFromContext[]> {
	if (projectIds.length === 0) return [];
	const { data, error } = await supabase
		.from('goals')
		.select('id, project_id, title, company_context_versions!inner(version_number)')
		.in('project_id', projectIds)
		.order('created_at');
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data.map(toGoalFromContext);
}

function toGoalFromContext(row: Record<string, unknown>): GoalFromContext {
	const version = row.company_context_versions as Record<string, unknown>;
	return {
		id: String(row.id),
		projectId: String(row.project_id),
		title: String(row.title),
		contextVersionNumber: Number(version.version_number)
	};
}
