/** The branch a project's work merges into before it is promoted to the default branch and goes live. */
export const stagingBranch = 'staging';

/** Whether a branch is the project's staging branch, rather than its default branch or any other. */
export function isStagingBranch(branch: string, defaultBranch: string): boolean {
	return branch === stagingBranch && branch !== defaultBranch;
}
