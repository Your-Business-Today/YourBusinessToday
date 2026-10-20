export const checkStates = { running: 'running', passed: 'passed', failed: 'failed' } as const;

export type CheckState = (typeof checkStates)[keyof typeof checkStates];

/** One check GitHub ran on one commit of a project's default branch, and where it got to. */
export type CommitCheck = { commitSha: string; checkName: string; state: CheckState; runUrl: string };

export function parseCommitCheck(row: Record<string, unknown>): CommitCheck {
	return {
		commitSha: row.commit_sha as string,
		checkName: row.check_name as string,
		state: row.state as CheckState,
		runUrl: row.run_url as string
	};
}
