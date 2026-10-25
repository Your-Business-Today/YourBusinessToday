import type { SupabaseClient } from '@supabase/supabase-js';
import { findProjectsByRepository } from './findProjectsByRepository';
import { findTasksOnBranch } from '$lib/server/projects/findTasksOnBranch';
import { recordGithubStep } from '$lib/server/lifecycle/recordGithubStep';
import { recordMergedPullRequest } from './recordMergedPullRequest';
import { setTaskBranch } from '$lib/server/projects/setTaskBranch';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import { pullRequestChanges, type PullRequestEvent } from './readPullRequestEvent';

export type BranchOutcome = { kind: 'no_task_on_branch' } | { kind: 'recorded'; taskIds: string[] };

/**
 * A pull request from a task's branch is recorded on the task, and its merge is recorded as the task's work
 * reaching staging or the default branch.
 */
export async function handleTaskBranchPullRequest(
	supabase: SupabaseClient,
	pullRequest: PullRequestEvent
): Promise<BranchOutcome> {
	const projects = await findProjectsByRepository(supabase, pullRequest.repositoryUrl);
	const projectIds = projects.map((project) => project.id);
	const tasks = await findTasksOnBranch(supabase, pullRequest.branchName, projectIds);
	if (tasks.length === 0) return { kind: 'no_task_on_branch' };
	for (const task of tasks) await recordOnTask(supabase, task, projects, pullRequest);
	return { kind: 'recorded', taskIds: tasks.map((task) => task.id) };
}

async function recordOnTask(
	supabase: SupabaseClient,
	task: ProjectTask,
	projects: Project[],
	pullRequest: PullRequestEvent
): Promise<void> {
	const branch = { branchName: task.branchName, pullRequestUrl: pullRequest.url };
	await setTaskBranch(supabase, task.id, branch);
	await recordGithubStep(supabase, task, pullRequest);
	if (pullRequest.change !== pullRequestChanges.merged) return;
	const project = projects.find((candidate) => candidate.id === task.projectId);
	if (project === undefined) return;
	await recordMergedPullRequest(supabase, task, project, pullRequest);
}
