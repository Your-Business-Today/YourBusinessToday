import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { MainRun } from '$lib/data/mainRun';
import { branchRunTables, type BranchRunTable } from './branchRunTables';

/**
 * The latest run of every check on the project's default branch, or on staging, by check name; none until its
 * migration runs.
 * Rows kept under a run title rather than their check's name, from before 0124, are left out.
 */
export async function getMainRunsForProject(
	supabase: SupabaseClient,
	projectId: string,
	table: BranchRunTable = branchRunTables.main
): Promise<MainRun[]> {
	const { data, error } = await supabase
		.from(table)
		.select('check_name, outcome, run_url, finished_at')
		.eq('project_id', projectId)
		.eq('is_named_for_its_check', true)
		.order('check_name');
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data.map((row) => ({
		checkName: row.check_name,
		outcome: row.outcome,
		runUrl: row.run_url,
		finishedAt: row.finished_at
	}));
}

/** The latest run of every check on the project's default branch and on its staging branch. */
export async function getBranchRunsForProject(supabase: SupabaseClient, projectId: string) {
	const mainRuns = await getMainRunsForProject(supabase, projectId);
	const stagingRuns = await getMainRunsForProject(supabase, projectId, branchRunTables.staging);
	return { mainRuns, stagingRuns };
}
