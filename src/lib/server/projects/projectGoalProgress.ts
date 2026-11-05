import { currentGoalHorizon } from '$lib/data/goalHorizon';
import { inProgressTaskStatus, isTaskDone } from '$lib/data/taskStatus';
import { openGoalStatus } from '$lib/data/goalStatus';
import type { ConversationTurn } from '$lib/data/conversationTurn';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { ProjectTask } from './taskRecord';

/** Where one current goal stands: its tasks done, being built, waiting on someone, and the rest still open. */
export type GoalProgress = {
	goalId: string;
	title: string;
	doneCount: number;
	buildingCount: number;
	waitingCount: number;
	openCount: number;
};

type GoalSources = { tasks: ProjectTask[]; goals: Goal[]; turnsByTask: Map<string, ConversationTurn> };

/** Every open current goal, in the project's order, with how its tasks stand. */
export function goalProgressOf({ tasks, goals, turnsByTask }: GoalSources): GoalProgress[] {
	const isWaiting = (task: ProjectTask) => (turnsByTask.get(task.id)?.awaiting ?? null) !== null;
	const currentGoals = goals.filter((goal) => goal.status === openGoalStatus && goal.horizon === currentGoalHorizon);
	const ordered = [...currentGoals].sort((left, right) => left.priority - right.priority);
	return ordered.map((goal) => {
		const goalTasks = tasks.filter((task) => task.goalId === goal.id);
		const openTasks = goalTasks.filter((task) => !isTaskDone(task.status));
		const waiting = openTasks.filter(isWaiting);
		const building = openTasks.filter((task) => task.status === inProgressTaskStatus && !isWaiting(task));
		return {
			goalId: goal.id,
			title: goal.title,
			doneCount: goalTasks.length - openTasks.length,
			buildingCount: building.length,
			waitingCount: waiting.length,
			openCount: openTasks.length - waiting.length - building.length
		};
	});
}
