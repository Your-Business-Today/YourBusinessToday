import type { FinishedRun } from '$lib/data/mainRun';
import type { Project } from '$lib/server/projects/projectRecord';
import type { MergeDeploy } from './mergeDeploy';

export function awaitingDeployMessage(merged: string, project: Project): string {
	return `${merged}. This task is done once its checks on ${project.defaultBranch} pass.`;
}

export function stagingMergeMessage(merged: string, project: Project): string {
	return `${merged}, so this task is done. It goes live when staging is promoted to ${project.defaultBranch}.`;
}

export function promotedLiveMessage(project: Project, promotionUrl: string): string {
	return `Staging was promoted to ${project.defaultBranch} (${promotionUrl}), so this task\u2019s work is live.`;
}

export function liveMessage(project: Project): string {
	return `Its checks on ${project.defaultBranch} passed, so its work is live and this task is done.`;
}

export function failedDeployMessage(project: Project, merge: MergeDeploy, run: FinishedRun): string {
	return [
		`${run.checkName} failed on ${project.defaultBranch} for this task's merge (${merge.pullRequestUrl}).`,
		'',
		`- The run: ${run.runUrl}`,
		'- The task stays open until it passes there: fix it forward on this task.'
	].join('\n');
}
