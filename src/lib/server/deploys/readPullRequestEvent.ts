export type PullRequestChange = 'opened' | 'merged';

export type PullRequestEvent = {
	change: PullRequestChange;
	branchName: string;
	url: string;
	repositoryUrl: string;
};

type GithubPullRequestEvent = {
	action?: string;
	pull_request?: { merged?: boolean; html_url?: string; head?: { ref?: string } };
	repository?: { html_url?: string };
};

const openingActions = new Set(['opened', 'reopened', 'ready_for_review']);

/** A pull request opened or merged from a branch, or null for anything else GitHub says of it. */
export function readPullRequestEvent(event: unknown): PullRequestEvent | null {
	const { action, pull_request: pullRequest, repository } = event as GithubPullRequestEvent;
	const change = changeOf(action, pullRequest?.merged === true);
	const branchName = pullRequest?.head?.ref ?? '';
	const url = pullRequest?.html_url ?? '';
	const repositoryUrl = repository?.html_url ?? '';
	if (change === null || branchName === '' || url === '' || repositoryUrl === '') return null;
	return { change, branchName, url, repositoryUrl };
}

function changeOf(action: string | undefined, isMerged: boolean): PullRequestChange | null {
	if (action === 'closed' && isMerged) return 'merged';
	if (action !== undefined && openingActions.has(action)) return 'opened';
	return null;
}
