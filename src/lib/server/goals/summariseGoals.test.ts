import { describe, expect, it } from 'vitest';
import { summariseGoals } from './summariseGoals';
import type { Goal } from './goalRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

const launch = { id: 'goal-launch', title: 'Launch' } as Goal;
const polish = { id: 'goal-polish', title: 'Polish' } as Goal;

function task(id: string, goalId: string | null, parentTaskId: string | null = null): ProjectTask {
	return {
		id,
		goalId,
		parentTaskId,
		kind: 'work',
		status: 'backlog',
		storyPoints: 1,
		completionPercent: 0
	} as ProjectTask;
}

function summaryOf(goal: Goal, tasks: ProjectTask[]) {
	return summariseGoals([launch, polish], tasks).find((summary) => summary.id === goal.id);
}

describe('summariseGoals', () => {
	it('counts a subtask with no goal of its own under its parent’s goal, as the backlog does', () => {
		const tasks = [task('parent', 'goal-launch'), task('child', null, 'parent')];
		expect(summaryOf(launch, tasks)?.taskCount).toBe(2);
	});

	it('counts a subtask carrying another goal under that goal, not its parent’s', () => {
		const tasks = [task('parent', 'goal-launch'), task('child', 'goal-polish', 'parent')];
		expect(summaryOf(launch, tasks)?.taskCount).toBe(1);
		expect(summaryOf(polish, tasks)?.taskCount).toBe(1);
	});

	it('counts a task whose goal is not on the project under no goal', () => {
		const tasks = [task('stray', 'goal-elsewhere')];
		expect(summaryOf(launch, tasks)?.taskCount).toBe(0);
		expect(summaryOf(polish, tasks)?.taskCount).toBe(0);
	});
});
