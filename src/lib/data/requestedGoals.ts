import { isAwaitingDesignApproval, type DesignReview } from './designReview';
import { goalIdsAwaitingApproval, isAwaitingWithItsParent } from './requestedHold';

type HeldTask = { id: string; goalId: string | null; parentTaskId: string | null; designReview?: DesignReview | null };
type TitledGoal = { id: string; title: string };

/** A top level task waiting on the Requested tab, with every chunk beneath it, as the board would show them. */
export type TaskWithChunks<Task> = { task: Task; chunks: Task[] };

/** A goal's plan waiting on the Requested tab as one: every task under it; goal is null for requests under no goal. */
export type RequestedGoal<Task, Goal> = { goal: Goal | null; tasks: TaskWithChunks<Task>[] };

/**
 * The work awaiting YBT, a goal at a time: every goal holding a request, with all its tasks, because approving
 * it accepts the goal's plan; then the requests that serve no goal. Bugs, features and infrastructure alike.
 */
export function requestedGoalsOf<Task extends HeldTask, Goal extends TitledGoal>(
	tasks: Task[],
	goals: Goal[]
): RequestedGoal<Task, Goal>[] {
	const heldGoalIds = goalIdsAwaitingApproval(tasks);
	const heldGoals = goals.filter((goal) => heldGoalIds.has(goal.id));
	const goalPlans = heldGoals.map((goal) => ({ goal, tasks: topTasksWithChunks(tasks, (task) => task.goalId === goal.id) }));
	const looseRequests = topTasksWithChunks(tasks, (task) => task.goalId === null && isAwaitingDesignApproval(task));
	const loosePlan = looseRequests.length === 0 ? [] : [{ goal: null, tasks: looseRequests }];
	return [...goalPlans, ...loosePlan];
}

function topTasksWithChunks<Task extends HeldTask>(tasks: Task[], isShown: (task: Task) => boolean): TaskWithChunks<Task>[] {
	const tasksById = new Map(tasks.map((task) => [task.id, task]));
	const topTasks = tasks.filter(isShown).filter((task) => !hasShownAncestor(task, tasksById, isShown));
	return topTasks.map((task) => ({ task, chunks: tasks.filter((other) => descendsFrom(other, task.id, tasksById)) }));
}

function hasShownAncestor<Task extends HeldTask>(task: Task, tasksById: Map<string, Task>, isShown: (task: Task) => boolean): boolean {
	const parent = task.parentTaskId === null ? undefined : tasksById.get(task.parentTaskId);
	if (parent === undefined) return false;
	return isShown(parent) || isAwaitingWithItsParent(parent, tasksById);
}

function descendsFrom<Task extends HeldTask>(task: Task, ancestorId: string, tasksById: Map<string, Task>): boolean {
	const seenTaskIds = new Set<string>();
	let parentTaskId = task.parentTaskId;
	while (parentTaskId !== null && !seenTaskIds.has(parentTaskId)) {
		if (parentTaskId === ancestorId) return true;
		seenTaskIds.add(parentTaskId);
		parentTaskId = tasksById.get(parentTaskId)?.parentTaskId ?? null;
	}
	return false;
}
