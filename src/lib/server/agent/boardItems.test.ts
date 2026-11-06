import { describe, expect, it } from 'vitest';
import { buildItems, longTermGoalItems } from './boardItems';
import type { AgendaBoard, BoardGoal, BoardTask } from './agendaBoard';

const task = (id: string, fields: Partial<BoardTask>): BoardTask => ({
	id, projectId: 'ybt', title: id, goalId: 'now', parentTaskId: null, waitsForTaskId: null, status: 'backlog',
	department: 'development', priority: 1, storyPoints: 2, isBuildable: true, createdAt: '2026-11-01T09:00:00Z', ...fields
});
const goal = (id: string, fields: Partial<BoardGoal>): BoardGoal => ({
	id, title: id, horizon: 'current', projectId: 'ybt', status: 'open', ...fields
});
const board = (goals: BoardGoal[], tasks: BoardTask[]): AgendaBoard => ({
	projectNamesById: new Map([['ybt', 'YourBusinessToday']]),
	goalsById: new Map(goals.map((each) => [each.id, each])),
	tasksById: new Map(tasks.map((each) => [each.id, each]))
});
const idsOf = (items: { subjectId: string | null }[]) => items.map(({ subjectId }) => subjectId);

describe('work the agent can start building', () => {
	const goals = [goal('now', {}), goal('later', { horizon: 'long_term' })];

	it('raises buildable development work on current goals that nobody has started', () => {
		const tasks = [
			task('ready', {}),
			task('parked', { goalId: 'later' }),
			task('not-buildable', { isBuildable: false }),
			task('admin', { department: 'administration' }),
			task('finished', { status: 'done' }),
			task('building', { status: 'in_progress' })
		];
		expect(idsOf(buildItems(board(goals, tasks)))).toEqual(['ready']);
	});

	it('raises a bug nobody has tagged buildable, since bugs come first', () => {
		const tasks = [
			task('FIX: overdue follow-ups show lost quotes', { isBuildable: false }),
			task('FIX: already being fixed', { isBuildable: false, status: 'in_progress' }),
			task('FIX: on a long term goal', { isBuildable: false, goalId: 'later' })
		];
		expect(idsOf(buildItems(board(goals, tasks)))).toEqual(['FIX: overdue follow-ups show lost quotes']);
	});

	it('holds back work waiting for a task that is not done, through its parent goal too', () => {
		const tasks = [
			task('blocker', { isBuildable: false }),
			task('waiting', { waitsForTaskId: 'blocker' }),
			task('child', { goalId: null, parentTaskId: 'blocker' })
		];
		expect(idsOf(buildItems(board(goals, tasks)))).toEqual(['child']);
	});
});

describe('long term goals to make current', () => {
	it('waits while any active project still has an open current goal', () => {
		const goals = [goal('now', {}), goal('later', { horizon: 'long_term' })];
		expect(longTermGoalItems(board(goals, []))).toEqual([]);
	});

	it('offers each open long term goal once every current goal is met', () => {
		const goals = [goal('now', { status: 'met' }), goal('later', { horizon: 'long_term' })];
		expect(idsOf(longTermGoalItems(board(goals, [])))).toEqual(['later']);
	});
});
