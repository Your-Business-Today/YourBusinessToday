/** A pull request a merge commit on the staging branch says was merged there, and the branch it came from. */
export type MergedPullRequest = { number: number; branchName: string };

export type CommitMessage = { message: string };

const mergeCommitPattern = /^Merge pull request #(\d+) from [^/\s]+\/(\S+)/;
const squashedCommitPattern = /\(#(\d+)\)\s*$/m;
const noBranchNamed = '';

/** The pull requests the commits record merging, newest first as GitHub lists them, each once. */
export function mergedPullRequestsOf(commits: CommitMessage[]): MergedPullRequest[] {
	const merged = commits.map((commit) => mergedPullRequestOf(commit.message)).filter((pullRequest) => pullRequest !== null);
	return eachOnce(merged);
}

function mergedPullRequestOf(message: string): MergedPullRequest | null {
	const mergeCommit = mergeCommitPattern.exec(message);
	if (mergeCommit !== null) return { number: Number(mergeCommit[1]), branchName: mergeCommit[2] };
	const squashed = squashedCommitPattern.exec(firstLineOf(message));
	if (squashed !== null) return { number: Number(squashed[1]), branchName: noBranchNamed };
	return null;
}

function firstLineOf(message: string): string {
	return message.split('\n')[0];
}

function eachOnce(pullRequests: MergedPullRequest[]): MergedPullRequest[] {
	const seen = new Set<number>();
	return pullRequests.filter((pullRequest) => {
		if (seen.has(pullRequest.number)) return false;
		seen.add(pullRequest.number);
		return true;
	});
}
