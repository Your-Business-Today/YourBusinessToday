import type { SupabaseClient } from '@supabase/supabase-js';
import { designReviewStates } from '$lib/data/designReview';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { parseTaskRecord, type ProjectTask } from '$lib/server/projects/taskRecord';

const mostRequestsRead = 200;

/** A request awaiting YBT: the task, its project's name, and what it would change. */
export type DesignRequestOnBoard = { task: ProjectTask; projectName: string; change: string };

/** The tasks on these projects that change the design and wait for YBT's approval, oldest first. */
export async function findDesignRequests(supabase: SupabaseClient, projectIds: string[]): Promise<DesignRequestOnBoard[]> {
	if (projectIds.length === 0) return [];
	const { data, error } = await supabase
		.from('tasks')
		.select('*, project:project_id(name)')
		.in('project_id', projectIds)
		.eq('design_review_state', designReviewStates.awaiting)
		.order('created_at', { ascending: true })
		.limit(mostRequestsRead);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return (data ?? []).map(parseRequest);
}

function parseRequest(row: Record<string, unknown>): DesignRequestOnBoard {
	const project = row.project as { name?: string } | null;
	const change = (row.design_change as string) ?? '';
	return { task: parseTaskRecord(row), projectName: project?.name ?? '', change };
}
