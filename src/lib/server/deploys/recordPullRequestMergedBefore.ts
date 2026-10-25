import type { SupabaseClient } from '@supabase/supabase-js';
import { describeLateMerge, mergeNotReadable, branchMismatch } from '$lib/data/lateMergeStanding';
import { githubRepositoryAddress } from '$lib/server/kit/readRepositoryFile';
import { isCommitOnBranch } from '$lib/server/github/compareBranches';
import { isStagingBranch } from '$lib/data/stagingBranch';
import { isTaskDone } from '$lib/data/taskStatus';
import { markTaskLive } from '$lib/server/mergeDeploys/markTaskLive';
import { promotedBeforeRecordedMessage } from '$lib/server/mergeDeploys/mergeDeployMessages';
import { readMergedPullRequest } from '$lib/server/github/readMergedPullRequest';
import { recordGithubStep } from '$lib/server/lifecycle/recordGithubStep';
import { recordMergedPullRequest } from './recordMergedPullRequest';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { PullRequestEvent } from './readPullRequestEvent';

const nothingToAdd = '';

/**
 * A pull request recorded on a task after GitHub's merge event has been and gone — a roll's pull request, one
 * opened before the task was raised — is read from GitHub and recorded as the webhook would have recorded it:
 * done and staged, and live too where staging has since been promoted. An open pull request is left for the
 * webhook, and one already recorded as merged is not recorded twice.
 */
export async function recordPullRequestMergedBefore(
	supabase: SupabaseClient,
	task: ProjectTask,
	project: Project,
	pullRequestUrl: string
): Promise<string> {
	const isAlreadyRecorded = task.stagedAt !== null || isTaskDone(task.status);
	if (isAlreadyRecorded) return nothingToAdd;
	try {
		return await recordFromGithub(supabase, task, project, pullRequestUrl);
	} catch (refusal) {
		return mergeNotReadable(refusal instanceof Error ? refusal.message : String(refusal));
	}
}

async function recordFromGithub(
	supabase: SupabaseClient,
	task: ProjectTask,
	project: Project,
	pullRequestUrl: string
): Promise<string> {
	const pullRequest = await readMergedPullRequest(pullRequestUrl);
	if (pullRequest === null) return nothingToAdd;
	if (pullRequest.branchName !== task.branchName) return branchMismatch(pullRequest.branchName, task.branchName);
	await recordGithubStep(supabase, task, pullRequest);
	await recordMergedPullRequest(supabase, task, project, pullRequest);
	const isStaged = isStagingBranch(pullRequest.baseBranch, project.defaultBranch);
	const isLive = isStaged && (await isPromotedSince(project, pullRequest));
	if (isLive) {
		await markTaskLive(supabase, task.id, project, new Date().toISOString(), promotedBeforeRecordedMessage(project));
	}
	return describeLateMerge({ isStaged, isLive, defaultBranch: project.defaultBranch });
}

/** Whether the default branch already holds the merge commit, which only a promotion of staging puts there. */
async function isPromotedSince(project: Project, pullRequest: PullRequestEvent): Promise<boolean> {
	const repositoryAddress = githubRepositoryAddress(pullRequest.repositoryUrl);
	if (repositoryAddress === null || pullRequest.mergeCommitSha === '') return false;
	return isCommitOnBranch(repositoryAddress, project.defaultBranch, pullRequest.mergeCommitSha);
}
