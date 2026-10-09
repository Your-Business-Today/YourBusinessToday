import { currentGoalHorizon, longTermGoalHorizon, type GoalHorizon } from './goalHorizon';

export type PlacedTask = { id: string; goalId: string | null; parentTaskId: string | null };

export type HorizonedGoal = { id: string; horizon: GoalHorizon };

/**
 * The horizon each task sits on: that of the goal it counts toward — its own
 * when it carries one of the project's goals, otherwise its parent's — and
 * current when it counts toward none. The same rule as settledGoalIds and
 * migration 0070's task_horizon, so every door agrees on what is current work.
 */
export function taskHorizons(tasks: PlacedTask[], goals: HorizonedGoal[]): Map<string, GoalHorizon> {
	const horizonByGoal = new Map(goals.map((goal) => [goal.id, goal.horizon]));
	const taskById = new Map(tasks.map((task) => [task.id, task]));
	const horizonByTask = new Map<string, GoalHorizon>();
	const horizonOf = (task: PlacedTask): GoalHorizon => {
		const known = horizonByTask.get(task.id);
		if (known !== undefined) return known;
		const horizon = settleHorizon(task, horizonByGoal, taskById, horizonOf);
		horizonByTask.set(task.id, horizon);
		return horizon;
	};
	for (const task of tasks) horizonOf(task);
	return horizonByTask;
}

/** The tasks on the current horizon: the ones whose completion counts and whose assignees are told. */
export function currentWork<Task extends PlacedTask>(tasks: Task[], goals: HorizonedGoal[]): Task[] {
	const horizonByTask = taskHorizons(tasks, goals);
	return tasks.filter((task) => horizonByTask.get(task.id) !== longTermGoalHorizon);
}

function settleHorizon(
	task: PlacedTask,
	horizonByGoal: Map<string, GoalHorizon>,
	taskById: Map<string, PlacedTask>,
	horizonOf: (task: PlacedTask) => GoalHorizon
): GoalHorizon {
	const ownHorizon = task.goalId === null ? undefined : horizonByGoal.get(task.goalId);
	if (ownHorizon !== undefined) return ownHorizon;
	const parent = task.parentTaskId === null ? undefined : taskById.get(task.parentTaskId);
	if (parent === undefined) return currentGoalHorizon;
	return horizonOf(parent);
}
