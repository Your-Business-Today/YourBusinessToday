import { describe, expect, it } from 'vitest';
import { describeTasklessGoals } from './describeTasklessGoals';
import type { TasklessGoal } from '$lib/server/goals/getTasklessGoalsRaisedBy';

const goal: TasklessGoal = {
	id: 'goal-1',
	projectId: 'project-1',
	projectName: 'Jewel Property Serve Website',
	title: 'Get listed on every directory',
	measure: '',
	status: 'open',
	horizon: 'current',
	department: 'development',
	priority: 1,
	isAutocomplete: false,
	createdBy: 'jeremy',
	createdAt: '2026-10-21T18:30:00Z'
};

describe('the goals someone raised and never gave a task', () => {
	it('says nothing when there are none', () => {
		expect(describeTasklessGoals([])).toEqual([]);
	});

	it('names each with its project and date, and says how to finish or delete it', () => {
		const lines = describeTasklessGoals([goal]).join('\n');
		expect(lines).toContain('"Get listed on every directory" on Jewel Property Serve Website, raised 21 Oct 2026');
		expect(lines).toContain('create_task');
		expect(lines).toContain('delete_goal');
	});
});
