const branchRefPrefix = 'refs/heads/';

export type PushedDeploy = {
	repositoryUrl: string;
	branch: string;
	commitSha: string;
	pushedAt: string;
	addedFiles: string[];
};

type PushEvent = {
	ref?: string;
	after?: string;
	deleted?: boolean;
	repository?: { html_url?: string };
	head_commit?: { timestamp?: string } | null;
	commits?: PushedCommit[];
};

type PushedCommit = { added?: string[]; removed?: string[] };

/** The deploy a GitHub push event describes, or null when the push is not to a branch or removed one. */
export function readPushEvent(event: unknown, receivedAt: Date): PushedDeploy | null {
	const { ref, after, deleted, repository, head_commit: headCommit, commits } = event as PushEvent;
	if (typeof ref !== 'string' || !ref.startsWith(branchRefPrefix)) return null;
	if (deleted === true) return null;
	const repositoryUrl = repository?.html_url ?? '';
	if (repositoryUrl === '') return null;
	return {
		repositoryUrl,
		branch: ref.slice(branchRefPrefix.length),
		commitSha: after ?? '',
		pushedAt: headCommit?.timestamp ?? receivedAt.toISOString(),
		addedFiles: filesAddedBy(commits ?? [])
	};
}

/**
 * Every file the push's commits added and did not later remove, read in commit order: a merge lists what the whole
 * branch brought, and a file the branch renamed or deleted shows as removed by a later commit.
 */
function filesAddedBy(commits: PushedCommit[]): string[] {
	const files = new Set<string>();
	for (const commit of commits) {
		for (const file of commit.added ?? []) files.add(file);
		for (const file of commit.removed ?? []) files.delete(file);
	}
	return [...files];
}
