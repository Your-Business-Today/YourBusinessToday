import { isAwaitingDesignApproval, type DesignReview } from './designReview';

type ReviewedTask = { parentTaskId: string | null; goalId?: string | null; designReview?: DesignReview | null };

/**
 * A task waits for YBT's approval when it does itself, or when the feature it is a chunk of does:
 * it belongs on the Requested tab, never on the board, until YBT approves it.
 */
export function isAwaitingWithItsParent(task: ReviewedTask, tasksById: Map<string, ReviewedTask>): boolean {
	const seenTaskIds = new Set<string>();
	let candidate: ReviewedTask | undefined = task;
	while (candidate !== undefined) {
		if (isAwaitingDesignApproval(candidate)) return true;
		const parentTaskId = candidate.parentTaskId;
		if (parentTaskId === null || seenTaskIds.has(parentTaskId)) return false;
		seenTaskIds.add(parentTaskId);
		candidate = tasksById.get(parentTaskId);
	}
	return false;
}

/** The goals holding a request that awaits YBT: approving one accepts the goal's plan, so the whole goal waits on Requested. */
export function goalIdsAwaitingApproval(tasks: ReviewedTask[]): Set<string> {
	const goalIds = tasks.filter(isAwaitingDesignApproval).map((task) => task.goalId ?? null);
	return new Set(goalIds.filter((goalId): goalId is string => goalId !== null));
}

/** A task waits on the Requested tab with its request, or with its goal while that goal holds a request. */
export function isOnRequested(task: ReviewedTask, tasksById: Map<string, ReviewedTask>, heldGoalIds: Set<string>): boolean {
	const isInHeldGoal = task.goalId != null && heldGoalIds.has(task.goalId);
	return isInHeldGoal || isAwaitingWithItsParent(task, tasksById);
}

/** The goals the board shows: a goal holding a request waits on the Requested tab with its plan. */
export function goalsOffRequested<Goal extends { id: string }>(goals: Goal[], allTasks: ReviewedTask[]): Goal[] {
	const heldGoalIds = goalIdsAwaitingApproval(allTasks);
	return goals.filter((goal) => !heldGoalIds.has(goal.id));
}
