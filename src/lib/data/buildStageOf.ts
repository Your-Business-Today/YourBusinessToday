import { buildStages, shownLiveSince, type BuildStage } from './buildStage';
import { departments, type Department } from './department';
import { lifecycleSteps, type LifecycleStepName } from './lifecycleStep';
import { isTaskDone, taskStatuses, type TaskStatus } from './taskStatus';

export type StageableTask = {
	department: Department;
	status: TaskStatus;
	isBuildable: boolean;
	stagedAt: string | null;
	liveAt: string | null;
};

/** What else says where a task stands: the latest step an AI or GitHub took on it, and when it was last marked done. */
export type StageFacts = { latestStep: LifecycleStepName | null; doneAt: string | null; now: Date };

const stepsInReview: readonly LifecycleStepName[] = [
	lifecycleSteps.reviewing,
	lifecycleSteps.pullRequestOpen,
	lifecycleSteps.merged
];

const stepsBuilding: readonly LifecycleStepName[] = [lifecycleSteps.building, lifecycleSteps.built];

/**
 * The column a task sits in on the scrum board, or null once its work went live too long ago to show.
 * Infrastructure is done by a person by hand, so it is placed by its status alone.
 */
export function buildStageOf(task: StageableTask, facts: StageFacts): BuildStage | null {
	if (task.department === departments.infrastructure) return infrastructureStageOf(task, facts);
	if (task.liveAt !== null) return liveWhileRecent(task.liveAt, facts.now);
	if (task.stagedAt !== null) return buildStages.staged;
	if (isTaskDone(task.status)) return liveWhileRecent(facts.doneAt, facts.now);
	return openStageOf(task, facts.latestStep);
}

function infrastructureStageOf(task: StageableTask, facts: StageFacts): BuildStage | null {
	if (isTaskDone(task.status)) return liveWhileRecent(facts.doneAt, facts.now);
	if (task.status === taskStatuses.inProgress) return buildStages.building;
	return buildStages.backlog;
}

function openStageOf(task: StageableTask, latestStep: LifecycleStepName | null): BuildStage {
	const isInReview = latestStep !== null && stepsInReview.includes(latestStep);
	const isBeingBuilt = latestStep !== null && stepsBuilding.includes(latestStep);
	if (task.status === taskStatuses.onHold) return buildStages.backlog;
	if (isInReview) return buildStages.inReview;
	if (isBeingBuilt) return buildStages.building;
	if (task.status === taskStatuses.inProgress) return buildStages.building;
	if (task.isBuildable) return buildStages.ready;
	return buildStages.backlog;
}

function liveWhileRecent(moment: string | null, now: Date): BuildStage | null {
	if (moment === null) return null;
	const earliestShown = shownLiveSince(now).getTime();
	if (Date.parse(moment) < earliestShown) return null;
	return buildStages.live;
}
