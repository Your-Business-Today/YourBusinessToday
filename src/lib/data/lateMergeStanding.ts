/** Where a pull request recorded after its merge left the task: done and staged, done and live, or done on the default branch. */
export type LateMergeStanding = { isStaged: boolean; isLive: boolean; defaultBranch: string };

export function branchMismatch(pullRequestBranch: string, taskBranch: string): string {
	return ` The pull request is from ${pullRequestBranch}, not ${taskBranch}, so its merge was not recorded on the task.`;
}

export function mergeNotReadable(reason: string): string {
	return ` GitHub could not say whether the pull request has merged (${reason}), so it is recorded as open.`;
}

/** The sentence added to set_task_branch's answer when the pull request had already merged. */
export function describeLateMerge(standing: LateMergeStanding): string {
	if (!standing.isStaged) return ` Its pull request had already merged into ${standing.defaultBranch}, so that is recorded.`;
	if (standing.isLive) {
		return ' Its pull request had already merged into staging and been promoted, so the task is done and its work is live.';
	}
	return ' Its pull request had already merged into staging, so the task is done and deploys at the next promotion.';
}
