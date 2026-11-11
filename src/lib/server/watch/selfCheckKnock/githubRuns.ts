import type { MigrationRunReader } from './migrationRunWait';

export type GitHubAccess = { repository: string; token: string };
type WorkflowRun = { status: string; conclusion: string | null; html_url: string };
type WorkflowRunPage = { workflow_runs: WorkflowRun[] };
type Commit = { sha: string };

const gitHubApi = 'https://api.github.com';
const migrationsWorkflow = 'run-migrations.yml';

/** Reads the latest run migrations run the push of a commit started, or null when that commit started none. */
export function migrationRunReader(access: GitHubAccess): MigrationRunReader {
	return async (commit) => {
		const runsOfCommit = `actions/workflows/${migrationsWorkflow}/runs?event=push&per_page=1&head_sha=${commit}`;
		const page = await readGitHub<WorkflowRunPage>(access, runsOfCommit);
		const [latestRun] = page.workflow_runs;
		if (latestRun === undefined) return null;
		return { status: latestRun.status, conclusion: latestRun.conclusion, url: latestRun.html_url };
	};
}

/** The commit at the head of a branch, which is what production serves when the branch is the default one. */
export async function readBranchHead(access: GitHubAccess, branch: string): Promise<string> {
	const head = await readGitHub<Commit>(access, `commits/${branch}`);
	return head.sha;
}

async function readGitHub<Answer>(access: GitHubAccess, path: string): Promise<Answer> {
	const headers = { authorization: `Bearer ${access.token}`, accept: 'application/vnd.github+json' };
	const response = await fetch(`${gitHubApi}/repos/${access.repository}/${path}`, { headers });
	if (!response.ok) throw new Error(`GitHub answered ${response.status} when asked for ${path}.`);
	return (await response.json()) as Answer;
}
