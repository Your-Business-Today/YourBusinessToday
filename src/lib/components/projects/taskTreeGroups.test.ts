import { describe, expect, it } from 'vitest';
import { groupTasksByGoal, type TaskGroup } from './taskTreeGroups';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

const launch = { id: 'goal-launch', title: 'Launch', horizon: 'current' } as Goal;
const polish = { id: 'goal-polish', title: 'Polish', horizon: 'current' } as Goal;
const someday = { id: 'goal-someday', title: 'Someday', horizon: 'long_term' } as Goal;

function task(id: string, goalId: string | null, subtasks: TaskTreeNode[] = []): TaskTreeNode {
	return { id, goalId, status: 'backlog', subtasks } as unknown as TaskTreeNode;
}

const idsOf = (tasks: TaskTreeNode[]) => tasks.map((candidate) => candidate.id);

function goalTitleOf(group: TaskGroup): string | undefined {
	const { goal } = group;
	return goal?.title;
}

describe('groupTasksByGoal', () => {
	it('puts the rest first, then keeps goal order and task order within a goal', () => {
		const groups = groupTasksByGoal(
			[task('a', null), task('b', 'goal-polish'), task('c', 'goal-launch'), task('d', 'goal-polish')],
			[launch, polish]
		);
		expect(groups.map((group) => goalTitleOf(group) ?? 'other')).toEqual(['other', 'Launch', 'Polish']);
		expect(groups[0].tasks.map((candidate) => candidate.id)).toEqual(['a']);
		expect(groups[2].tasks.map((candidate) => candidate.id)).toEqual(['b', 'd']);
	});

	it('lists the current goals before the long term ones, whatever their priority order', () => {
		const groups = groupTasksByGoal(
			[task('a', 'goal-someday'), task('b', 'goal-launch')],
			[someday, launch]
		);
		expect(groups.map((group) => group.goal)).toEqual([launch, someday]);
	});

	it('leaves out goals with nothing under them and the rest when there is none', () => {
		const groups = groupTasksByGoal([task('a', 'goal-launch')], [launch, polish]);
		expect(groups.map(goalTitleOf)).toEqual(['Launch']);
	});

	it('treats a task whose goal is gone as outside any goal', () => {
		const groups = groupTasksByGoal([task('a', 'goal-deleted')], [launch]);
		expect(groups[0].goal).toBeNull();
	});

	it('lists a subtask under its own goal when it carries a different one from its parent', () => {
		const groups = groupTasksByGoal(
			[task('permissions', 'goal-polish', [task('login-roles', 'goal-launch')])],
			[launch, polish]
		);
		expect(groups.map(goalTitleOf)).toEqual(['Launch', 'Polish']);
		expect(idsOf(groups[0].tasks)).toEqual(['login-roles']);
		expect(idsOf(groups[1].tasks)).toEqual(['permissions']);
		expect(groups[1].tasks[0].subtasks).toEqual([]);
	});

	it('keeps a subtask with no goal of its own under its parent', () => {
		const groups = groupTasksByGoal([task('parent', 'goal-launch', [task('child', null)])], [launch]);
		expect(groups).toHaveLength(1);
		expect(idsOf(groups[0].tasks[0].subtasks)).toEqual(['child']);
	});

	it('narrows each group after forming it, so a hidden parent keeps its goal for its subtasks', () => {
		const doneParent = { ...task('parent', 'goal-launch', [task('child', null)]), status: 'done' };
		const withoutParent = (tasks: TaskTreeNode[]) => tasks.flatMap((candidate) => candidate.subtasks);
		const groups = groupTasksByGoal([doneParent as TaskTreeNode], [launch], withoutParent);
		expect(groups[0].goal).toBe(launch);
		expect(idsOf(groups[0].tasks)).toEqual(['child']);
	});
});
