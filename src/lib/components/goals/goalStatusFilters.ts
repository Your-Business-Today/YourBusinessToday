import type { GoalSummary } from '$lib/server/goals/summariseGoals';
import { openGoalStatus } from '$lib/data/goalStatus';

export function openGoalsOnly(goalSummaries: GoalSummary[]): GoalSummary[] {
	return goalSummaries.filter((goalSummary) => goalSummary.status === openGoalStatus);
}
