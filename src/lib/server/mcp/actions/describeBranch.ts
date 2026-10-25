import { describeStagingStanding } from '$lib/data/stagedTasks';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export function branchLine(task: ProjectTask): string {
	const pullRequest = task.pullRequestUrl === '' ? '' : ` Pull request: ${task.pullRequestUrl}.`;
	if (task.branchName === '') return `No branch recorded — set_task_branch when you make one.${pullRequest}`;
	const standing = describeStagingStanding(task);
	const merged = standing === '' ? '' : ` ${standing}`;
	return `Branch: ${task.branchName}.${pullRequest}${merged}`;
}
