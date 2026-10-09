import { describe, expect, it } from 'vitest';
import { openGoalsOnly } from './goalStatusFilters';
import type { GoalSummary } from '$lib/server/goals/getGoalSummaries';
import type { GoalStatus } from '$lib/data/goalStatus';

function goalSummary(id: string, status: GoalStatus): GoalSummary {
	return {
		id,
		projectId: 'project-1',
		title: `Goal ${id}`,
		measure: 'A measure both sides can check',
		status,
		horizon: 'current',
		priority: 1,
		createdBy: null,
		createdAt: '2026-09-18T00:00:00.000Z',
		taskCount: 0,
		doneTaskCount: 0,
		completionPercent: 0,
		awaitingAnswerCount: 0
	};
}

describe('openGoalsOnly', () => {
	it('keeps the open goals and drops the met and dropped ones', () => {
		const goalSummaries = [
			goalSummary('a', 'open'),
			goalSummary('b', 'met'),
			goalSummary('c', 'dropped')
		];

		expect(openGoalsOnly(goalSummaries).map((goal) => goal.id)).toEqual(['a']);
	});

	it('returns nothing when every goal is met', () => {
		expect(openGoalsOnly([goalSummary('a', 'met')])).toEqual([]);
	});

	it('returns nothing for an empty list', () => {
		expect(openGoalsOnly([])).toEqual([]);
	});
});
