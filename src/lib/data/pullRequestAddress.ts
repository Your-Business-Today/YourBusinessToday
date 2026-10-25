/** A pull request's repository and number, read from its address on GitHub. */
export type PullRequestAddress = { repositoryUrl: string; number: number };

const pullRequestPathPattern = /^(https:\/\/github\.com\/[^/]+\/[^/]+)\/pull\/(\d+)\/?$/i;

/** The repository and number of https://github.com/<owner>/<name>/pull/<number>, or null for any other address. */
export function pullRequestAddressOf(pullRequestUrl: string): PullRequestAddress | null {
	const match = pullRequestPathPattern.exec(pullRequestUrl.trim());
	if (match === null) return null;
	return { repositoryUrl: match[1], number: Number(match[2]) };
}
