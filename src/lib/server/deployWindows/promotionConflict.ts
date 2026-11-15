import { repositoryNameOf } from '$lib/server/mainRuns/failedRunTask';
import { stagingBranch } from '$lib/data/stagingBranch';
import { taskStatuses } from '$lib/data/taskStatus';
import type { Project } from '$lib/server/projects/projectRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

type PromotedProject = Pick<Project, 'defaultBranch' | 'repositoryUrl'>;

/** Added to a promotion's note when GitHub had not worked out, in the looks it was given, whether the pull request can be merged. */
export const mergeabilityNotKnownSentence = 'GitHub had not yet said whether it can be merged.';

/** Why nothing deploys when staging and the default branch conflict, and what puts it right. */
export function conflictNote(project: PromotedProject, pullRequestUrl: string): string {
	const { defaultBranch } = project;
	const whatIsWrong = `${stagingBranch} conflicts with ${defaultBranch}, so ${pullRequestUrl} cannot merge and nothing deploys.`;
	const whatPutsItRight = `Merge ${defaultBranch} into a branch cut from ${stagingBranch}, settle the conflict there, and send it into ${stagingBranch}.`;
	return `${whatIsWrong} ${whatPutsItRight}`;
}

export function conflictTaskTitle(project: PromotedProject): string {
	const repositoryName = repositoryNameOf(project.repositoryUrl);
	return `FIX: ${stagingBranch} conflicts with ${project.defaultBranch} in ${repositoryName}, so nothing deploys`;
}

export function conflictTaskDetails(project: PromotedProject, pullRequestUrl: string): string {
	const { defaultBranch } = project;
	return [
		`The deploy window opened ${pullRequestUrl} to send ${stagingBranch} into ${defaultBranch}, and GitHub says the two conflict.`,
		'It cannot merge, so nothing deploys until this is put right. The window tries again every hour.',
		'',
		`- The usual cause is work merged straight into ${defaultBranch}, which ${stagingBranch} never took in.`,
		`- Cut a branch from fresh ${stagingBranch}, merge ${defaultBranch} into it, settle the conflicts and run the repository’s checks.`,
		`- Send it into ${stagingBranch} as a pull request, merged with a merge commit and never a squash.`,
		`- A squash leaves ${stagingBranch} without what ${defaultBranch} holds, and the conflict comes back.`
	].join('\n');
}

/** Whether the task that puts this project's conflict right is already raised and not yet done, so it is never raised twice. */
export function hasOpenConflictTask(tasks: Pick<ProjectTask, 'title' | 'status'>[], project: PromotedProject): boolean {
	const title = conflictTaskTitle(project);
	return tasks.some((task) => task.title === title && task.status !== taskStatuses.done);
}
