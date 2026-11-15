import { pullRequestAddressOf } from './pullRequestAddress';
import { isTaskDone, type TaskStatus } from './taskStatus';

/** What a task on a pull request's branch carries that says whether the pull request is its own. */
export type BranchTask = { status: TaskStatus; pullRequestUrl: string };

/**
 * A task on a pull request's branch takes the pull request as its own while it is still open, or when the pull
 * request is the one it recorded. A task finished by another pull request keeps that one and its record, because a
 * project thread restarts its one branch under the same name for each pull request it opens.
 */
export function isTakingPullRequest(task: BranchTask, pullRequestUrl: string): boolean {
	if (!isTaskDone(task.status)) return true;
	return isSamePullRequest(task.pullRequestUrl, pullRequestUrl);
}

/** Whether two addresses name the same pull request: the same repository, whatever its case, and the same number. */
export function isSamePullRequest(recordedUrl: string, pullRequestUrl: string): boolean {
	const recorded = pullRequestAddressOf(recordedUrl);
	const given = pullRequestAddressOf(pullRequestUrl);
	if (recorded === null || given === null) return false;
	const isSameRepository = recorded.repositoryUrl.toLowerCase() === given.repositoryUrl.toLowerCase();
	return isSameRepository && recorded.number === given.number;
}
