import type { SupabaseClient } from '@supabase/supabase-js';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { mergeDeployColumns, parseMergeDeploy, type MergeDeploy } from './mergeDeploy';
import { parseCommitCheck, type CommitCheck } from './commitCheck';

const lookbackDays = 30;
const millisecondsPerDay = 86_400_000;

/** The task merges made as this commit on the project, one per task on its branch; none until the migration runs. */
export async function findMergeDeploys(
	supabase: SupabaseClient,
	projectId: string,
	commitSha: string
): Promise<MergeDeploy[]> {
	const { data, error } = await supabase
		.from('task_merge_deploys')
		.select(mergeDeployColumns)
		.match({ project_id: projectId, commit_sha: commitSha });
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return data.map(parseMergeDeploy);
}

/** The project's task merges of the last month, and every check run on their commits. */
export async function readRecentMerges(
	supabase: SupabaseClient,
	projectId: string
): Promise<{ merges: MergeDeploy[]; checks: CommitCheck[] }> {
	const since = new Date(Date.now() - lookbackDays * millisecondsPerDay).toISOString();
	const { data, error } = await supabase
		.from('task_merge_deploys')
		.select(mergeDeployColumns)
		.eq('project_id', projectId)
		.gte('merged_at', since);
	if (isSchemaNotYetMigrated(error)) return { merges: [], checks: [] };
	if (error) throw error;
	const merges = data.map(parseMergeDeploy);
	return { merges, checks: await readChecksOn(supabase, projectId, merges) };
}

async function readChecksOn(supabase: SupabaseClient, projectId: string, merges: MergeDeploy[]): Promise<CommitCheck[]> {
	if (merges.length === 0) return [];
	const commitShas = merges.map((merge) => merge.commitSha);
	const { data, error } = await supabase
		.from('commit_checks')
		.select('commit_sha, check_name, state, run_url')
		.eq('project_id', projectId)
		.in('commit_sha', commitShas);
	if (error) throw error;
	return data.map(parseCommitCheck);
}
