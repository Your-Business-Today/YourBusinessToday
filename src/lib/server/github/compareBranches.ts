import { githubGet } from './githubRequest';
import type { CommitMessage } from '$lib/data/mergedPullRequests';

/** How far the head branch is ahead of the base, and the commits that make the difference, as GitHub compares them. */
export type BranchComparison = { aheadBy: number; commits: CommitMessage[] };

type GithubCommit = { commit: { message: string } };

type GithubComparison = { ahead_by: number; commits: GithubCommit[] };

const nothingAhead = 0;

export async function compareBranches(repositoryAddress: string, base: string, head: string): Promise<BranchComparison> {
	const compareAddress = `${repositoryAddress}/compare/${encodeURIComponent(base)}...${encodeURIComponent(head)}`;
	const comparison = await githubGet<GithubComparison>(compareAddress);
	return { aheadBy: comparison.ahead_by, commits: comparison.commits.map(messageOf) };
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
