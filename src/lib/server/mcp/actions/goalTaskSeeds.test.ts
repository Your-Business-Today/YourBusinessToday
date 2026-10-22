import { describe, expect, it } from 'vitest';
import { mostTasksRaisedWithGoal, listedTaskSeeds } from './goalTaskSeeds';

const storyTask = {
	title: 'As a director, I want the bank balance each morning, so that I know where we stand',
	storyRole: 'a director',
	storyWant: 'the bank balance each morning',
	storyBenefit: 'I know where we stand'
};

describe('the tasks a goal is raised with', () => {
	it('reads each task as a work task with its story and no goal yet', () => {
		const [seed] = listedTaskSeeds({ tasks: [storyTask] }) ?? [];
		expect(seed.title).toBe(storyTask.title);
		expect(seed.story).toEqual({ role: 'a director', want: storyTask.storyWant, benefit: storyTask.storyBenefit });
		expect(seed.goalId).toBeNull();
	});

	it('refuses an empty list, too many tasks, a task with no title and a field it does not take', () => {
		const tooMany = Array.from({ length: mostTasksRaisedWithGoal + 1 }, () => storyTask);
		expect(listedTaskSeeds({ tasks: [] })).toBeNull();
		expect(listedTaskSeeds({ tasks: tooMany })).toBeNull();
		expect(listedTaskSeeds({ tasks: [{ details: 'no title' }] })).toBeNull();
		expect(listedTaskSeeds({ tasks: [{ ...storyTask, assignee: 'Jeremy' }] })).toBeNull();
		expect(listedTaskSeeds({ tasks: 'one task' })).toBeNull();
	});
});
