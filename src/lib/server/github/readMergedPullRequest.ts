import { githubGet } from './githubRequest';
import { githubRepositoryAddress } from '$lib/server/kit/readRepositoryFile';
import { commitShaOrNone } from '$lib/data/commitSha';
import { pullRequestAddressOf } from '$lib/data/pullRequestAddress';
import { pullRequestChanges, type PullRequestEvent } from '$lib/server/deploys/readPullRequestEvent';

type GithubPullRequest = {
	merged_at?: string | null;
	html_url?: string;
	merge_commit_sha?: string | null;
	head?: { ref?: string };
	base?: { ref?: string; repo?: { html_url?: string } };
};

/**
 * A pull request that has already merged, read from GitHub as the webhook would have told it, or null while it
 * is still open, was closed without merging, or is not a pull request on GitHub at all.
 */
export async function readMergedPullRequest(pullRequestUrl: string): Promise<PullRequestEvent | null> {
	const address = pullRequestAddressOf(pullRequestUrl);
	if (address === null) return null;
	const repositoryAddress = githubRepositoryAddress(address.repositoryUrl);
	if (repositoryAddress === null) return null;
	const pullRequest = await githubGet<GithubPullRequest>(`${repositoryAddress}/pulls/${address.number}`);
	return mergedEventOf(pullRequest, address.repositoryUrl);
}

function mergedEventOf(pullRequest: GithubPullRequest, repositoryUrl: string): PullRequestEvent | null {
	const isMerged = (pullRequest.merged_at ?? null) !== null;
	if (!isMerged) return null;
	const head = pullRequest.head ?? {};
	const base = pullRequest.base ?? {};
	const baseRepository = base.repo ?? {};
	return {
		change: pullRequestChanges.merged,
		branchName: head.ref ?? '',
		baseBranch: base.ref ?? '',
		url: pullRequest.html_url ?? '',
		repositoryUrl: baseRepository.html_url ?? repositoryUrl,
		mergeCommitSha: commitShaOrNone(pullRequest.merge_commit_sha)
	};
}
