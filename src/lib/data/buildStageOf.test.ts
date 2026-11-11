import { describe, expect, it } from 'vitest';
import { buildStageOf, type StageableTask, type StageFacts } from './buildStageOf';
import { buildStages } from './buildStage';
import { departments } from './department';
import { lifecycleSteps } from './lifecycleStep';
import { taskStatuses } from './taskStatus';

const now = new Date('2026-11-11T15:00:00Z');
const threeDaysAgo = '2026-11-08T10:00:00Z';
const twentyDaysAgo = '2026-10-22T10:00:00Z';

const openFeature: StageableTask = {
	department: departments.development,
	status: taskStatuses.backlog,
	isBuildable: false,
	stagedAt: null,
	liveAt: null
};

const noFacts: StageFacts = { latestStep: null, doneAt: null, now };

function stageOf(task: Partial<StageableTask>, facts: Partial<StageFacts> = {}) {
	return buildStageOf({ ...openFeature, ...task }, { ...noFacts, ...facts });
}

describe('the column a development task sits in', () => {
	it('is Backlog until it is considered buildable, and Ready once it is', () => {
		expect(stageOf({})).toBe(buildStages.backlog);
		expect(stageOf({}, { latestStep: lifecycleSteps.considering })).toBe(buildStages.backlog);
		expect(stageOf({ isBuildable: true }, { latestStep: lifecycleSteps.considered })).toBe(buildStages.ready);
	});

	it('is Building while a building or built step holds it, or a person has started it', () => {
		const inProgress = taskStatuses.inProgress;
		expect(stageOf({ status: inProgress, isBuildable: true }, { latestStep: lifecycleSteps.building })).toBe(buildStages.building);
		expect(stageOf({ status: inProgress }, { latestStep: lifecycleSteps.built })).toBe(buildStages.building);
		expect(stageOf({ status: inProgress })).toBe(buildStages.building);
	});

	it('is In review while its pull request is open or it is being reviewed', () => {
		const inProgress = taskStatuses.inProgress;
		expect(stageOf({ status: inProgress }, { latestStep: lifecycleSteps.pullRequestOpen })).toBe(buildStages.inReview);
		expect(stageOf({ status: inProgress }, { latestStep: lifecycleSteps.reviewing })).toBe(buildStages.inReview);
	});

	it('is Staged once merged into staging, and Live once a deploy carried it, for 14 days', () => {
		const done = taskStatuses.done;
		expect(stageOf({ status: done, stagedAt: threeDaysAgo })).toBe(buildStages.staged);
		expect(stageOf({ status: done, stagedAt: twentyDaysAgo, liveAt: threeDaysAgo })).toBe(buildStages.live);
		expect(stageOf({ status: done, stagedAt: twentyDaysAgo, liveAt: twentyDaysAgo })).toBeNull();
	});

	it('is Live for 14 days after it was marked done on a project with no staging', () => {
		const done = taskStatuses.done;
		expect(stageOf({ status: done }, { doneAt: threeDaysAgo })).toBe(buildStages.live);
		expect(stageOf({ status: done }, { doneAt: null })).toBeNull();
	});

	it('goes back to Backlog while it is on hold', () => {
		expect(stageOf({ status: taskStatuses.onHold, isBuildable: true }, { latestStep: lifecycleSteps.building })).toBe(buildStages.backlog);
	});
});

describe('the column an infrastructure task sits in', () => {
	const infrastructure = { department: departments.infrastructure };

	it('follows its status, as a person does it by hand', () => {
		expect(stageOf({ ...infrastructure, isBuildable: true })).toBe(buildStages.backlog);
		expect(stageOf({ ...infrastructure, status: taskStatuses.inProgress })).toBe(buildStages.building);
		expect(stageOf({ ...infrastructure, status: taskStatuses.done }, { doneAt: threeDaysAgo })).toBe(buildStages.live);
		expect(stageOf({ ...infrastructure, status: taskStatuses.done }, { doneAt: twentyDaysAgo })).toBeNull();
	});
});
