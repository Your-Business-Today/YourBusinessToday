import { compareBranches } from '$lib/server/github/compareBranches';
import { enableAutoMerge } from '$lib/server/github/enableAutoMerge';
import {
	findOpenPullRequest,
	mergePullRequest,
	openPullRequest,
	rewritePullRequestBody,
	type PullRequest
} from '$lib/server/github/pullRequests';
import { githubRepositoryAddress } from '$lib/server/kit/readRepositoryFile';
import { stagingBranch } from '$lib/data/stagingBranch';
import { deployWindowOutcomes, type DeployWindowOutcome } from '$lib/data/deployWindow';
import { deploySummaryOf, describeDeploySummary, type DeployableTask } from '$lib/data/deploySummary';
import { mergedPullRequestsOf } from '$lib/data/mergedPullRequests';
import { promotionBody, promotionDraft, type PromotionWording } from './promotionPullRequest';
import type { DeployStart } from '$lib/data/deployStart';
import type { Project } from '$lib/server/projects/projectRecord';
import type { UkClock } from '$lib/data/ukClock';

/** What the promotion did for one project: the pull request it opened or found and the tasks it carries, or why nothing was promoted. */
export type Promotion = { outcome: DeployWindowOutcome; pullRequestUrl: string; note: string; summary: string };

/** What a promotion is asked for: by whom, and against which tasks its merged pull requests are matched. */
export type PromotionRequest = { start: DeployStart; tasks: DeployableTask[] };

const cleanStatusRefusal = 'clean status';
const noSummary = '';

/**
 * Opens the pull request from staging into the default branch when staging holds files the default branch lacks, reuses the one already open,
 * and turns auto-merge on; nothing to promote is a quiet skip, and anything GitHub refuses is kept as the note.
 */
export async function promoteStaging(project: Project, clock: UkClock, request: PromotionRequest): Promise<Promotion> {
	const repositoryAddress = githubRepositoryAddress(project.repositoryUrl);
	if (repositoryAddress === null) return failed(`${project.repositoryUrl} is not a GitHub repository.`);
	try {
		return await promoteThroughGithub(repositoryAddress, project, clock, request);
	} catch (refusal) {
		return failed(refusal instanceof Error ? refusal.message : String(refusal));
	}
}

async function promoteThroughGithub(
	repositoryAddress: string,
	project: Project,
	clock: UkClock,
	request: PromotionRequest
): Promise<Promotion> {
	const comparison = await compareBranches(repositoryAddress, project.defaultBranch, stagingBranch);
	if (comparison.holdsTheSameFiles) {
		const note = `${project.defaultBranch} already holds every file on ${stagingBranch}.`;
		return { outcome: deployWindowOutcomes.nothingToPromote, pullRequestUrl: '', note, summary: noSummary };
	}
	const deploySummary = deploySummaryOf(mergedPullRequestsOf(comparison.commits), request.tasks);
	const summary = describeDeploySummary(deploySummary, project.repositoryUrl);
	const wording = { commitCount: comparison.aheadBy, start: request.start, summary };
	const open = await findOpenPullRequest(repositoryAddress, project.defaultBranch, stagingBranch);
	const pullRequest = open ?? (await openPullRequest(repositoryAddress, promotionDraft(project, clock, wording)));
	const isReused = open !== null;
	const body = promotionBody(project, wording);
	if (isReused) {
		await rewritePullRequestBody(repositoryAddress, pullRequest, body);
	}
	const outcome = isReused ? deployWindowOutcomes.reused : deployWindowOutcomes.opened;
	const note = await mergeAtGreen(repositoryAddress, pullRequest);
	return { outcome, pullRequestUrl: pullRequest.url, note, summary };
}

/** Auto-merge, or the merge itself when GitHub says there is nothing left to wait for; any other refusal is reported. */
async function mergeAtGreen(repositoryAddress: string, pullRequest: PullRequest): Promise<string> {
	try {
		await enableAutoMerge(pullRequest);
		return 'Merges itself once its checks pass.';
	} catch (refusal) {
		const message = refusal instanceof Error ? refusal.message : String(refusal);
		if (!message.includes(cleanStatusRefusal)) return `Auto-merge was refused (${message}); merge it by hand at green.`;
		await mergePullRequest(repositoryAddress, pullRequest);
		return 'Merged at once: its checks had already passed.';
	}
}

function failed(note: string): Promotion {
	return { outcome: deployWindowOutcomes.failed, pullRequestUrl: '', note, summary: noSummary };
}
