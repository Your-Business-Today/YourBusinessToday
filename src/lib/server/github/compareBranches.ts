import { githubGet } from './githubRequest';
import type { CommitMessage } from '$lib/data/mergedPullRequests';
import { hasTheSameFiles } from '$lib/data/branchDifference';

/** How far the head branch is ahead of the base, the commits that make the difference, and whether they leave any file different, as GitHub compares them. */
export type BranchComparison = { aheadBy: number; commits: CommitMessage[]; hasTheSameFiles: boolean };

type GithubCommit = { commit: { message: string } };

type GithubComparison = { ahead_by: number; commits: GithubCommit[]; files?: unknown[] };

const nothingAhead = 0;

export async function compareBranches(repositoryAddress: string, base: string, head: string): Promise<BranchComparison> {
	const compareAddress = `${repositoryAddress}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`;
	const comparison = await githubGet<GithubComparison>(compareAddress);
	const difference = { aheadBy: comparison.ahead_by, changedFiles: comparison.files };
	return { aheadBy: comparison.ahead_by, commits: comparison.commits.map(messageOf), hasTheSameFiles: hasTheSameFiles(difference) };
}

/** Whether the branch already holds the commit: GitHub finds the commit no further ahead of the branch than the branch itself. */
export async function isCommitOnBranch(repositoryAddress: string, branch: string, commitSha: string): Promise<boolean> {
	const comparison = await compareBranches(repositoryAddress, branch, commitSha);
	return comparison.aheadBy === nothingAhead;
}

function messageOf(entry: GithubCommit): CommitMessage {
	const { commit } = entry;
	return { message: commit.message };
}
