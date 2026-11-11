import type { Goal } from '$lib/server/goals/goalRecord';

/** How far a subtask's line sits in from its parent's in read_project's backlog. */
export const subtaskIndent = '  ';

/** `, under "<goal>"` for a task that serves a goal, else nothing. */
export function underGoalPhrase(goalId: string | null, goals: Goal[]): string {
	const goal = goals.find((candidate) => candidate.id === goalId);
	if (goal === undefined) return '';
	return `, under "${goal.title}"`;
}
