import type { SupabaseClient } from '@supabase/supabase-js';
import { getMainRunsForProject } from '$lib/server/mainRuns/getMainRunsForProject';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { Project } from '$lib/server/projects/projectRecord';
import type { PullRequestEvent } from '$lib/server/deploys/readPullRequestEvent';

/**
 * Remembers a task's merge so it is done once its checks pass on the default branch. A project with no checks
 * reporting there, a merge GitHub gave no commit for, or a database not yet migrated waits for nothing.
 */
export async function awaitMergeDeploy(
	supabase: SupabaseClient,
	taskId: string,
	project: Project,
	pullRequest: PullRequestEvent
): Promise<boolean> {
	if (pullRequest.mergeCommitSha === '') return false;
	const mainRuns = await getMainRunsForProject(supabase, project.id);
	if (mainRuns.length === 0) return false;
	const { error } = await supabase.from('task_merge_deploys').upsert(
		{
			task_id: taskId,
			project_id: project.id,
			commit_sha: pullRequest.mergeCommitSha,
			pull_request_url: pullRequest.url
		},
		{ onConflict: 'task_id,commit_sha', ignoreDuplicates: true }
	);
	if (isSchemaNotYetMigrated(error)) return false;
	if (error) throw error;
	return true;
}
