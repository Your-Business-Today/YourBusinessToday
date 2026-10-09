export type GoalHorizon = 'current' | 'long_term';

export const goalHorizonOrder: GoalHorizon[] = ['current', 'long_term'];

export const currentGoalHorizon: GoalHorizon = 'current';

export const longTermGoalHorizon: GoalHorizon = 'long_term';

export const goalHorizonLabels: Record<GoalHorizon, string> = {
	current: 'Current',
	long_term: 'Long term'
};

export function parseGoalHorizon(value: unknown): GoalHorizon {
	const horizon = goalHorizonOrder.find((candidate) => candidate === value);
	if (horizon === undefined) return currentGoalHorizon;
	return horizon;
}

export function isCurrentGoal(goal: { horizon: GoalHorizon }): boolean {
	return goal.horizon === currentGoalHorizon;
}

export function goalsOnHorizon<HorizonedGoal extends { horizon: GoalHorizon }>(
	goals: HorizonedGoal[],
	horizon: GoalHorizon
): HorizonedGoal[] {
	return goals.filter((goal) => goal.horizon === horizon);
}

/** "of the project’s current goals" — where a goal's priority number ranks it. */
export function goalPriorityScope(horizon: GoalHorizon): string {
	return `of the project’s ${goalHorizonLabels[horizon].toLowerCase()} goals`;
}
