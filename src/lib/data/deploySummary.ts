import { companyDetails } from './companyDetails';
import type { MergedPullRequest } from './mergedPullRequests';

/** What a task carries that ties it to a pull request merged into staging. */
export type DeployableTask = { id: string; projectId: string; title: string; branchName: string; pullRequestUrl: string };

export type DeployedTask = { task: DeployableTask; pullRequest: MergedPullRequest };

/** The tasks a promotion carries, and the merged pull requests no task claims, so nothing deployed is hidden. */
export type DeploySummary = { deployed: DeployedTask[]; unclaimed: MergedPullRequest[] };

export const emptyDeploySummary: DeploySummary = { deployed: [], unclaimed: [] };

const pullRequestPathPattern = /\/pull\/(\d+)\/?$/;

/** Matches each merged pull request to the task that recorded it, by its number first and its branch otherwise. */
export function deploySummaryOf(merged: MergedPullRequest[], tasks: DeployableTask[]): DeploySummary {
	const deployed: DeployedTask[] = [];
	const unclaimed: MergedPullRequest[] = [];
	for (const pullRequest of merged) {
		const task = tasks.find((candidate) => claimsPullRequest(candidate, pullRequest));
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

function claimsPullRequest(task: DeployableTask, pullRequest: MergedPullRequest): boolean {
	const recordedNumber = pullRequestNumberOf(task.pullRequestUrl);
	if (recordedNumber !== null) return recordedNumber === pullRequest.number;
	return task.branchName !== '' && task.branchName === pullRequest.branchName;
}

function pullRequestNumberOf(pullRequestUrl: string): number | null {
	const found = pullRequestPathPattern.exec(pullRequestUrl);
	return found === null ? null : Number(found[1]);
}

function deployedTaskLine({ task, pullRequest }: DeployedTask, repositoryUrl: string): string {
	const taskLink = `[${task.title}](${companyDetails.websiteUrl}/projects/${task.projectId}/tasks/${task.id})`;
	return `- ${taskLink} — ${pullRequestLink(pullRequest, repositoryUrl)}`;
}

function unclaimedLine(pullRequest: MergedPullRequest, repositoryUrl: string): string {
	return `- ${pullRequestLink(pullRequest, repositoryUrl)} (no task recorded it)`;
}

function pullRequestLink(pullRequest: MergedPullRequest, repositoryUrl: string): string {
	return `[#${pullRequest.number}](${repositoryUrl.replace(/\/+$/, '')}/pull/${pullRequest.number})`;
}
