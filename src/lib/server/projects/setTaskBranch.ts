import type { SupabaseClient } from '@supabase/supabase-js';

export type TaskBranch = { branchName: string; pullRequestUrl?: string };

/** Record the git branch a task's work is on, and its pull request once there is one. */
export async function setTaskBranch(
	supabase: SupabaseClient,
	taskId: string,
	branch: TaskBranch
): Promise<void> {
	const pullRequest =
		branch.pullRequestUrl === undefined ? {} : { pull_request_url: branch.pullRequestUrl };
	const { error } = await supabase
		.from('tasks')
		.update({ branch_name: branch.branchName, ...pullRequest })
		.eq('id', taskId);
	if (error) throw error;
}
