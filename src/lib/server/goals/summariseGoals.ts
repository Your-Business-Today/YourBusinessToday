import { buildTaskTree } from '$lib/server/projects/buildTaskTree';
import { settledGoalIds } from '$lib/data/settledGoalIds';
import { weightedCompletionPercent } from '$lib/data/completionSummary';
import type { Goal } from './goalRecord';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

export type GoalSummary = Goal & {
	taskCount: number;
	doneTaskCount: number;
	completionPercent: number;
	awaitingAnswerCount: number;
};

/** Each goal counts the tasks the backlog groups under it, its subtasks' included. */
export function summariseGoals(goals: Goal[], tasks: ProjectTask[]): GoalSummary[] {
	const knownGoalIds = new Set(goals.map((goal) => goal.id));
	const goalIdsByTask = settledGoalIds(buildTaskTree(tasks), knownGoalIds);
	const tasksOf = (goal: Goal) => tasks.filter((task) => goalIdsByTask.get(task.id) === goal.id);
	return goals.map((goal) => summariseGoal(goal, tasksOf(goal)));
}

function summariseGoal(goal: Goal, goalTasks: ProjectTask[]): GoalSummary {
	return {
		...goal,
		taskCount: goalTasks.length,
		doneTaskCount: goalTasks.filter((task) => task.status === 'done').length,
		completionPercent: weightedCompletionPercent(goalTasks),
		awaitingAnswerCount: goalTasks.filter(
			(task) => task.kind === 'support' && task.status === 'backlog'
		).length
	};
}
