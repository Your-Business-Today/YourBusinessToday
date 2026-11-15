import { portalAddress } from '$lib/portal/portalAddress';
import type { MergedPullRequest } from './mergedPullRequests';
import { pullRequestAddressOf } from './pullRequestAddress';

/** What a task carries that ties it to a pull request merged into staging. */
export type DeployableTask = { id: string; projectId: string; title: string; branchName: string; pullRequestUrl: string };

export type DeployedTask = { task: DeployableTask; pullRequest: MergedPullRequest };

/** The tasks a promotion carries, and the merged pull requests no task claims, so nothing deployed is hidden. */
export type DeploySummary = { deployed: DeployedTask[]; unclaimed: MergedPullRequest[] };

export const emptyDeploySummary: DeploySummary = { deployed: [], unclaimed: [] };

/**
 * Matches each merged pull request to the task that recorded its number, across every task, and only a pull request
 * no task recorded to a task on its branch that has recorded none, so a task newly put on a reused branch does not
 * take the pull requests merged from it before.
 */
export function deploySummaryOf(merged: MergedPullRequest[], tasks: DeployableTask[]): DeploySummary {
	const deployed: DeployedTask[] = [];
	const unclaimed: MergedPullRequest[] = [];
	for (const pullRequest of merged) {
		const task = taskRecording(tasks, pullRequest) ?? taskAwaitingOnBranch(tasks, pullRequest);
		if (task === undefined) unclaimed.push(pullRequest);
		if (task !== undefined) deployed.push({ task, pullRequest });
	}
	return { deployed, unclaimed };
}

/** The summary as Markdown lines for the promotion pull request and the window record; '' when it carries nothing. */
export function describeDeploySummary(summary: DeploySummary, repositoryUrl: string): string {
	const { deployed, unclaimed } = summary;
	const taskLines = deployed.map((deployedTask) => deployedTaskLine(deployedTask, repositoryUrl));
	const unclaimedLines = unclaimed.map((pullRequest) => unclaimedLine(pullRequest, repositoryUrl));
	return [...taskLines, ...unclaimedLines].join('\n');
}

function taskRecording(tasks: DeployableTask[], pullRequest: MergedPullRequest): DeployableTask | undefined {
	return tasks.find((candidate) => pullRequestNumberOf(candidate.pullRequestUrl) === pullRequest.number);
}

function taskAwaitingOnBranch(tasks: DeployableTask[], pullRequest: MergedPullRequest): DeployableTask | undefined {
	const tasksWithNoPullRequest = tasks.filter((candidate) => pullRequestNumberOf(candidate.pullRequestUrl) === null);
	return tasksWithNoPullRequest.find((candidate) => candidate.branchName !== '' && candidate.branchName === pullRequest.branchName);
}

function pullRequestNumberOf(pullRequestUrl: string): number | null {
	const address = pullRequestAddressOf(pullRequestUrl);
	return address === null ? null : address.number;
}

function deployedTaskLine({ task, pullRequest }: DeployedTask, repositoryUrl: string): string {
	const taskLink = `[${task.title}](${portalAddress.origin}/projects/${task.projectId}/tasks/${task.id})`;
	return `- ${taskLink} — ${pullRequestLink(pullRequest, repositoryUrl)}`;
}

function unclaimedLine(pullRequest: MergedPullRequest, repositoryUrl: string): string {
	return `- ${pullRequestLink(pullRequest, repositoryUrl)} (no task recorded it)`;
}

function pullRequestLink(pullRequest: MergedPullRequest, repositoryUrl: string): string {
	return `[#${pullRequest.number}](${repositoryUrl.replace(/\/+$/, '')}/pull/${pullRequest.number})`;
}
