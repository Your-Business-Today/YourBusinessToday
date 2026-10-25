import { countCommitsAhead } from '$lib/server/github/compareBranches';
import { enableAutoMerge } from '$lib/server/github/enableAutoMerge';
import { findOpenPullRequest, mergePullRequest, openPullRequest, type PullRequest } from '$lib/server/github/pullRequests';
import { githubRepositoryAddress } from '$lib/server/kit/readRepositoryFile';
import { stagingBranch } from '$lib/data/stagingBranch';
import { deployWindowOutcomes, type DeployWindowOutcome } from '$lib/data/deployWindow';
import { promotionDraft } from './promotionPullRequest';
import type { DeployStart } from '$lib/data/deployStart';
import type { Project } from '$lib/server/projects/projectRecord';
import type { UkClock } from '$lib/data/ukClock';

/** What the window did for one project: the pull request it opened or found, or why nothing was promoted. */
export type Promotion = { outcome: DeployWindowOutcome; pullRequestUrl: string; note: string };

const nothingAhead = 0;
const cleanStatusRefusal = 'clean status';

/**
 * Opens the pull request from staging into the default branch when staging is ahead, reuses the one already open,
 * and turns auto-merge on; nothing to promote is a quiet skip, and anything GitHub refuses is kept as the note.
 */
export async function promoteStaging(project: Project, clock: UkClock, start: DeployStart): Promise<Promotion> {
	const repositoryAddress = githubRepositoryAddress(project.repositoryUrl);
	if (repositoryAddress === null) return failed(`${project.repositoryUrl} is not a GitHub repository.`);
	try {
		return await promoteThroughGithub(repositoryAddress, project, clock, start);
	} catch (refusal) {
		return failed(refusal instanceof Error ? refusal.message : String(refusal));
	}
}

async function promoteThroughGithub(
	repositoryAddress: string,
	project: Project,
	clock: UkClock,
	start: DeployStart
): Promise<Promotion> {
	const commitCount = await countCommitsAhead(repositoryAddress, project.defaultBranch, stagingBranch);
	if (commitCount === nothingAhead) {
		const note = `${project.defaultBranch} already holds everything on ${stagingBranch}.`;
		return { outcome: deployWindowOutcomes.nothingToPromote, pullRequestUrl: '', note };
	}
	const open = await findOpenPullRequest(repositoryAddress, project.defaultBranch, stagingBranch);
	const pullRequest = open ?? (await openPullRequest(repositoryAddress, promotionDraft(project, clock, commitCount, start)));
	const outcome = open === null ? deployWindowOutcomes.opened : deployWindowOutcomes.reused;
	const note = await mergeAtGreen(repositoryAddress, pullRequest);
	return { outcome, pullRequestUrl: pullRequest.url, note };
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
	return { outcome: deployWindowOutcomes.failed, pullRequestUrl: '', note };
}
