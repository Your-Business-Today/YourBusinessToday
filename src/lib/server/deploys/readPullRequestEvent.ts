import { commitShaOrNone } from '$lib/data/commitSha';

export type PullRequestChange = 'opened' | 'merged';

export const pullRequestChanges = { opened: 'opened', merged: 'merged' } as const;

export type PullRequestEvent = {
	change: PullRequestChange;
	branchName: string;
	baseBranch: string;
	url: string;
	repositoryUrl: string;
	mergeCommitSha: string;
};

type GithubPullRequestEvent = {
	action?: string;
	pull_request?: {
		merged?: boolean;
		html_url?: string;
		merge_commit_sha?: string | null;
		head?: { ref?: string };
		base?: { ref?: string };
	};
	repository?: { html_url?: string };
};

const openingActions = new Set(['opened', 'reopened', 'ready_for_review']);
const closingAction = 'closed';

/** A pull request opened or merged from a branch into its base, or null for anything else GitHub says of it. */
export function readPullRequestEvent(event: unknown): PullRequestEvent | null {
	const { action, pull_request: pullRequest, repository } = event as GithubPullRequestEvent;
	const change = changeOf(action, pullRequest?.merged === true);
	const head = pullRequest?.head;
	const branchName = head?.ref ?? '';
	const base = pullRequest?.base;
	const baseBranch = base?.ref ?? '';
	const url = pullRequest?.html_url ?? '';
	const repositoryUrl = repository?.html_url ?? '';
	if (change === null || branchName === '' || url === '' || repositoryUrl === '') return null;
	const mergeCommitSha = change === pullRequestChanges.merged ? commitShaOrNone(pullRequest?.merge_commit_sha) : '';
	return { change, branchName, baseBranch, url, repositoryUrl, mergeCommitSha };
}

function changeOf(action: string | undefined, isMerged: boolean): PullRequestChange | null {
	if (action === closingAction && isMerged) return pullRequestChanges.merged;
	if (action !== undefined && openingActions.has(action)) return pullRequestChanges.opened;
	return null;
}
