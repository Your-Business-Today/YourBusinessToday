import { githubGet, githubPost, githubPut } from './githubRequest';

export type PullRequest = { number: number; nodeId: string; url: string };

export type PullRequestDraft = { base: string; head: string; title: string; body: string };

type GithubPullRequest = { number: number; node_id: string; html_url: string };

const mergeCommitMethod = 'merge';
const repositoriesSegment = 'repos';

/** The open pull request from the head branch into the base branch of the same repository, or null when none is. */
export async function findOpenPullRequest(
	repositoryAddress: string,
	base: string,
	head: string
): Promise<PullRequest | null> {
	const owner = ownerOf(repositoryAddress);
	const query = `state=open&base=${encodeURIComponent(base)}&head=${encodeURIComponent(`${owner}:${head}`)}`;
	const open = await githubGet<GithubPullRequest[]>(`${repositoryAddress}/pulls?${query}`);
	return open.length === 0 ? null : pullRequestOf(open[0]);
}

export async function openPullRequest(repositoryAddress: string, draft: PullRequestDraft): Promise<PullRequest> {
	const opened = await githubPost<GithubPullRequest>(`${repositoryAddress}/pulls`, draft);
	return pullRequestOf(opened);
}

/** Merges the pull request as a merge commit; GitHub refuses while a required check is pending or failing. */
export async function mergePullRequest(repositoryAddress: string, pullRequest: PullRequest): Promise<void> {
	await githubPut(`${repositoryAddress}/pulls/${pullRequest.number}/merge`, { merge_method: mergeCommitMethod });
}

function pullRequestOf(pullRequest: GithubPullRequest): PullRequest {
	return { number: pullRequest.number, nodeId: pullRequest.node_id, url: pullRequest.html_url };
}

/** The owner in https://api.github.com/repos/<owner>/<name>, which GitHub wants in front of a head branch. */
function ownerOf(repositoryAddress: string): string {
	const segments = repositoryAddress.split('/');
	return segments[segments.indexOf(repositoriesSegment) + 1] ?? '';
}
