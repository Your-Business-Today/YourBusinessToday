import { describe, expect, it } from 'vitest';
import { scrumBoardOf } from './scrumBoardOf';
import { buildStages } from '$lib/data/buildStage';
import { departments, type Department } from '$lib/data/department';
import { lifecycleSteps } from '$lib/data/lifecycleStep';
import { workKinds } from '$lib/data/scrumBoard';
import type { LifecycleMark } from '$lib/server/lifecycle/getLifecycleMarks';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

const now = new Date('2026-11-11T15:00:00Z');
const opus = { modelId: 'claude-opus', label: 'Claude Opus', runsOn: '', leastPoints: 1, mostPoints: 13 };

function taskOf(id: string, title: string, department: Department, fields: Partial<ProjectTask> = {}): ProjectTask {
	return {
		id,
		projectId: 'project',
		parentTaskId: null,
		title,
		department,
		status: 'backlog',
		storyPoints: 3,
		isBuildable: false,
		modelNeeded: null,
		stagedAt: null,
		liveAt: null,
		pullRequestUrl: '',
		...fields
	} as ProjectTask;
}

function markOf(taskId: string, step: LifecycleMark['latest']['step']): LifecycleMark {
	return { latest: { taskId, step, agent: 'Local model' }, claim: null } as unknown as LifecycleMark;
}

describe('the Development side as a scrum board', () => {
	const tasks = [
		taskOf('story', 'Show the board', departments.development, { status: 'in_progress', pullRequestUrl: 'https://github.com/x/pull/1' }),
		taskOf('subtask', 'Draw the columns', departments.development, { parentTaskId: 'story', isBuildable: true }),
		taskOf('fix', 'FIX: the board is blank', departments.development, { isBuildable: true }),
		taskOf('secret', 'Store the deploy key', departments.infrastructure),
		taskOf('insurance', 'Buy the insurance', departments.administration),
		taskOf('shipped', 'Ship the export', departments.development, { status: 'done', stagedAt: '2026-11-01T00:00:00Z', liveAt: '2026-11-10T01:00:00Z', storyPoints: 5 })
	];
	const board = scrumBoardOf({
		projectTasks: tasks,
		marks: new Map([['story', markOf('story', lifecycleSteps.pullRequestOpen)]]),
		buildModels: [opus],
		doneAtByTask: new Map(),
		now
	});
	const columnAt = (stage: string) => board.columns.find((column) => column.stage === stage);

	it('leaves Internal work off the board and puts every development and infrastructure task in one column', () => {
		const shownIds = board.columns.flatMap((column) => column.cards.map((card) => card.id));
		expect(shownIds.sort()).toEqual(['fix', 'secret', 'shipped', 'story', 'subtask']);
	});

	it('places each by its latest step, its tag and its dates, bugs first', () => {
		expect(columnAt(buildStages.inReview)?.cards.map((card) => card.id)).toEqual(['story']);
		expect(columnAt(buildStages.ready)?.cards.map((card) => card.id)).toEqual(['fix', 'subtask']);
		expect(columnAt(buildStages.backlog)?.cards.map((card) => card.id)).toEqual(['secret']);
		expect(columnAt(buildStages.live)?.cards.map((card) => card.id)).toEqual(['shipped']);
	});

	it('gives a subtask its parent’s kind, and the model only to built work', () => {
		const ready = columnAt(buildStages.ready)?.cards ?? [];
		expect(ready.map((card) => card.workKind)).toEqual([workKinds.bug, workKinds.feature]);
		expect(ready[0].modelLabel).toBe('Claude Opus');
		expect(columnAt(buildStages.backlog)?.cards[0].modelLabel).toBeNull();
	});

	it('carries the lifecycle badge and the pull request on the card', () => {
		const [story] = columnAt(buildStages.inReview)?.cards ?? [];
		expect(story.lifecycle).toEqual({ step: lifecycleSteps.pullRequestOpen, agent: 'Local model', isHeld: false });
		expect(story.pullRequestUrl).toBe('https://github.com/x/pull/1');
	});

	it('counts the points that went live this week in the velocity', () => {
		const { weeks } = board.velocity;
		const thisWeek = weeks.at(-1);
		expect(thisWeek?.points).toBe(5);
	});
});
