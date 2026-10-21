import type { SupabaseClient } from '@supabase/supabase-js';
import { awaitMergeDeploy } from '$lib/server/mergeDeploys/awaitMergeDeploy';
import { awaitingDeployMessage, stagingMergeMessage } from '$lib/server/mergeDeploys/mergeDeployMessages';
import { bringMergesLive } from '$lib/server/mergeDeploys/bringMergesLive';
import { findProjectsByRepository } from './findProjectsByRepository';
import { findTasksOnBranch } from '$lib/server/projects/findTasksOnBranch';
import { postMessage } from '$lib/server/conversations/postMessage';
import { recordGithubStep } from '$lib/server/lifecycle/recordGithubStep';
import { setTaskBranch } from '$lib/server/projects/setTaskBranch';
import { updateTaskStatus } from '$lib/server/projects/updateTaskStatus';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import { pullRequestChanges, type PullRequestEvent } from './readPullRequestEvent';
import { supportTaskKind } from '$lib/data/taskKind';
import { doneTaskStatus } from '$lib/data/taskStatus';
import { isStagingBranch } from '$lib/data/stagingBranch';

const nobodySignedIn = null;

export type BranchOutcome = { kind: 'no_task_on_branch' } | { kind: 'recorded'; taskIds: string[] };

/**
 * A pull request from a task's branch is recorded on the task. Its merge into staging marks the task done at once,
 * since the promotion to the default branch is the deploy. Its merge into the default branch marks the task done
 * once the merge's checks there pass, or at once on a project where no checks report there.
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
	await recordMerge(supabase, task, project, pullRequest);
}

async function recordMerge(
	supabase: SupabaseClient,
	task: ProjectTask,
	project: Project,
	pullRequest: PullRequestEvent
): Promise<void> {
	const merged = `Merged: ${pullRequest.url} brought ${task.branchName} into ${mergedInto(pullRequest, project)}`;
	if (task.kind === supportTaskKind) {
		const sentence = `${merged}. Resolve this with the answer the person who raised it will read.`;
		await postMessage(supabase, { taskId: task.id }, project.ownerId, sentence);
		return;
	}
	if (isStagingBranch(pullRequest.baseBranch, project.defaultBranch)) {
		await finishTask(supabase, task, project, stagingMergeMessage(merged, project));
		return;
	}
	const isAwaitingDeploy = await awaitMergeDeploy(supabase, task.id, project, pullRequest);
	if (isAwaitingDeploy) {
		await postMessage(supabase, { taskId: task.id }, project.ownerId, awaitingDeployMessage(merged, project));
		await bringMergesLive(supabase, project);
		return;
	}
	await finishTask(supabase, task, project, `${merged}, so this task is done.`);
}

async function finishTask(supabase: SupabaseClient, task: ProjectTask, project: Project, sentence: string) {
	await updateTaskStatus(supabase, task.id, doneTaskStatus, nobodySignedIn);
	await postMessage(supabase, { taskId: task.id }, project.ownerId, sentence);
}

/** The branch a merge landed on: the one GitHub named, or the default branch when it named none. */
function mergedInto(pullRequest: PullRequestEvent, project: Project): string {
	return pullRequest.baseBranch === '' ? project.defaultBranch : pullRequest.baseBranch;
}
