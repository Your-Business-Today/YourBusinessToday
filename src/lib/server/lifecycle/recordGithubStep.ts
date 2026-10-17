import type { SupabaseClient } from '@supabase/supabase-js';
import { githubAgent, lifecycleOutcomes, lifecycleSteps } from '$lib/data/lifecycleStep';
import { pullRequestChanges, type PullRequestEvent } from '$lib/server/deploys/readPullRequestEvent';
import { recordLifecycleStep } from './recordLifecycleStep';
import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

const stepForChange = {
	[pullRequestChanges.opened]: lifecycleSteps.pullRequestOpen,
	[pullRequestChanges.merged]: lifecycleSteps.merged
};

/**
 * GitHub's own steps on a task's lifecycle: its pull request opened, and merged. The merge that
 * brings migration 0114 arrives before the migration has run, and the task must still close, so a
 * missing table skips the step rather than failing the webhook.
 */
export async function recordGithubStep(
	supabase: SupabaseClient,
	task: ProjectTask,
	pullRequest: PullRequestEvent
): Promise<void> {
	try {
		await recordGithubChange(supabase, task, pullRequest);
	} catch (failure) {
		if (!isSchemaNotYetMigrated(failure)) throw failure;
	}
}

async function recordGithubChange(
	supabase: SupabaseClient,
	task: ProjectTask,
	pullRequest: PullRequestEvent
): Promise<void> {
	await recordLifecycleStep(supabase, task.projectId, { taskId: task.id }, {
		step: stepForChange[pullRequest.change],
		outcome: lifecycleOutcomes.none,
		agent: githubAgent,
		model: '',
		runUrl: pullRequest.url,
		branchName: task.branchName,
		note: ''
	});
}
