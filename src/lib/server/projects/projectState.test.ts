import { describe, expect, it } from 'vitest';
import { projectStateOf } from './projectState';
import type { ConversationTurn } from '$lib/data/conversationTurn';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { ProjectTask } from './taskRecord';

const now = new Date('2026-11-05T12:00:00Z');
const lastMonth = '2026-10-01T09:00:00Z';
const yesterday = '2026-11-04T09:00:00Z';

const task = (id: string, title: string, fields: Partial<ProjectTask> = {}) =>
	({
		id, title, projectId: 'ybt', parentTaskId: null, goalId: 'launch', department: 'development',
		status: 'backlog', priority: 1, createdAt: lastMonth, stagedAt: null, resolvedAt: null, ...fields
	}) as ProjectTask;

const launch = { id: 'launch', title: 'Launch', status: 'open', horizon: 'current', priority: 1 } as Goal;
const waitingOnJeremy: ConversationTurn = {
	authorAccountId: 'james', postedVia: 'claude', awaiting: { accountId: 'jeremy', kind: 'person' }, pickedUpAt: null, since: lastMonth
};
const stateOf = (tasks: ProjectTask[], turns: [string, ConversationTurn][] = []) =>
	projectStateOf({ tasks, goals: [launch], turnsByTask: new Map(turns), now });

describe('how a project stands', () => {
	it('says bugs are open whenever one is, whatever else holds it up', () => {
		const state = stateOf([task('login', 'FIX: login fails'), task('terms', 'Add terms')], [['terms', waitingOnJeremy]]);
		expect(state.verdict).toBe('bugsOpen');
		const { nextStep } = state;
		expect(nextStep).toMatchObject({ title: 'FIX: login fails', isBug: true });
	});

	it('counts a subtask of a bug as part of the bug', () => {
		const state = stateOf([task('login', 'FIX: login fails', { status: 'done' }), task('step', 'Reset tokens', { parentTaskId: 'login' })]);
		expect(state.openBugs.map((bug) => bug.id)).toEqual(['step']);
	});

	it('names who it waits on when no bug is open', () => {
		const state = stateOf([task('terms', 'Add terms')], [['terms', waitingOnJeremy]]);
		expect(state.verdict).toBe('waitingOnPeople');
		expect(state.blocking).toEqual([{ accountId: 'jeremy', taskIds: ['terms'], oldestSince: lastMonth }]);
	});

	it('is stalled when nothing has moved for a week and nothing waits on anyone', () => {
		expect(stateOf([task('terms', 'Add terms')]).verdict).toBe('stalled');
	});

	it('is on track when work merged this week', () => {
		const state = stateOf([task('terms', 'Add terms'), task('cards', 'Cards', { status: 'done', stagedAt: yesterday })]);
		expect(state.verdict).toBe('onTrack');
		expect(state.mergedThisWeekCount).toBe(1);
		expect(state.goals).toEqual([
			{ goalId: 'launch', title: 'Launch', doneCount: 1, buildingCount: 0, waitingCount: 0, openCount: 1 }
		]);
	});
});
