import { formatBritishDate } from '$lib/data/britishDate';
import type { TasklessGoal } from '$lib/server/goals/getTasklessGoalsRaisedBy';

/** The goals a person raised that were never given a task: each one to finish or to delete with them. */
export function describeTasklessGoals(goals: TasklessGoal[]): string[] {
	if (goals.length === 0) return [];
	return [
		`Goals you raised that have no tasks yet (${goals.length}) — ask the person whether to give ` +
			'each its tasks (create_task with its goalId) or delete it (delete_goal):',
		...goals.map(tasklessGoalLine),
		''
	];
}

function tasklessGoalLine(goal: TasklessGoal): string {
	const raisedOn = formatBritishDate(goal.createdAt);
	return `- "${goal.title}" on ${goal.projectName}, raised ${raisedOn} (goal id: ${goal.id})`;
}
