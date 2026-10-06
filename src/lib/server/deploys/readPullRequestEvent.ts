export type PullRequestChange = 'opened' | 'merged';

export const pullRequestChanges = { opened: 'opened', merged: 'merged' } as const;

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
const closingAction = 'closed';

/** A pull request opened or merged from a branch, or null for anything else GitHub says of it. */
export function readPullRequestEvent(event: unknown): PullRequestEvent | null {
	const { action, pull_request: pullRequest, repository } = event as GithubPullRequestEvent;
	const change = changeOf(action, pullRequest?.merged === true);
	const head = pullRequest?.head;
	const branchName = head?.ref ?? '';
	const url = pullRequest?.html_url ?? '';
	const repositoryUrl = repository?.html_url ?? '';
	if (change === null || branchName === '' || url === '' || repositoryUrl === '') return null;
	return { change, branchName, url, repositoryUrl };
}

function changeOf(action: string | undefined, isMerged: boolean): PullRequestChange | null {
	if (action === closingAction && isMerged) return pullRequestChanges.merged;
	if (action !== undefined && openingActions.has(action)) return pullRequestChanges.opened;
	return null;
}
