import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { MainRun } from '$lib/data/mainRun';

/** The latest run of every check on the project's default branch, by check name; none until its migration runs. */
export async function getMainRunsForProject(supabase: SupabaseClient, projectId: string): Promise<MainRun[]> {
	const { data, error } = await supabase
		.from('project_main_runs')
		.select('check_name, outcome, run_url, finished_at')
		.eq('project_id', projectId)
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
