export const longestBranchName = 255;

const branchNamePattern = /^(?!\/)(?!.*\/\/)(?!.*\.\.)[A-Za-z0-9._/-]+(?<![/.])$/;
const webAddressPattern = /^https:\/\/\S+$/;

export const branchNameRules =
	'letters, digits, dots, dashes, underscores and slashes, such as feature/weekly-cashflow-grid';

/** Why a branch name cannot be recorded, or null when it can. An empty name clears it. */
export function branchNameRefusal(branchName: string): string | null {
	if (branchName === '') return null;
	if (branchName.length > longestBranchName) {
		return `A branch name is at most ${longestBranchName} characters.`;
	}
	if (!branchNamePattern.test(branchName)) return `A branch name is ${branchNameRules}.`;
	return null;
}

export function pullRequestUrlRefusal(pullRequestUrl: string): string | null {
	if (pullRequestUrl === '' || webAddressPattern.test(pullRequestUrl)) return null;
	return 'A pull request is its https:// address on GitHub.';
}

/** Where a branch can be seen on the repository's site, or null when the project has no repository. */
export function branchWebAddress(repositoryUrl: string, branchName: string): string | null {
	if (repositoryUrl === '' || branchName === '') return null;
	return `${repositoryUrl.replace(/\/+$/, '')}/tree/${branchName}`;
}

/** A task's work never happens on the default branch, so it is never recorded as a task's branch. */
export function taskBranchRefusal(branchName: string, defaultBranch: string): string | null {
	if (branchName === defaultBranch) {
		return `${defaultBranch} is the default branch — a task's work goes on a branch of its own.`;
	}
	return branchNameRefusal(branchName);
}
