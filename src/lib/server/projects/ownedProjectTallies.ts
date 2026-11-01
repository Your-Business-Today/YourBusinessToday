import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { tallyOwnedProjectsInSite } from './tallyOwnedProjectsInSite';

/** The current work on a project: a task under a long term goal counts toward none of these. */
export type TaskTally = {
	openTaskCount: number;
	taskCount: number;
	completionPercent: number;
};

export type ProjectTally = TaskTally & { longTermGoalCount: number };

/** Each owned project's figures for the projects list, keyed by project id, counted by the database. */
export async function getOwnedProjectTallies(
	supabase: SupabaseClient,
	ownerId: string
): Promise<Map<string, ProjectTally>> {
	const { data, error } = await supabase.rpc('owned_project_tallies', { owner: ownerId });
	if (isSchemaNotYetMigrated(error)) return tallyOwnedProjectsInSite(supabase, ownerId);
	if (error) throw error;
	return new Map(data.map((row: Record<string, unknown>) => [row.project_id as string, parseTally(row)]));
}

function parseTally(row: Record<string, unknown>): ProjectTally {
	return {
		openTaskCount: Number(row.open_task_count),
		taskCount: Number(row.task_count),
		completionPercent: Number(row.completion_percent),
		longTermGoalCount: Number(row.long_term_goal_count)
	};
}
