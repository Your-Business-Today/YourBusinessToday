import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

/**
 * The goal each task counts toward: its own when it carries one of the
 * project's goals, otherwise its parent's. The backlog groups tasks by it,
 * the goal rows count by it, and migration 0069 settles a goal's status by
 * the same rule, so all three agree on which tasks a goal holds.
 */
export function settledGoalIds(
	taskTree: TaskTreeNode[],
	knownGoalIds: Set<string>,
	parentGoalId: string | null = null,
	goalIdsByTask = new Map<string, string | null>()
): Map<string, string | null> {
	for (const task of taskTree) {
		const hasKnownGoal = task.goalId !== null && knownGoalIds.has(task.goalId);
		const goalId = hasKnownGoal ? task.goalId : parentGoalId;
		goalIdsByTask.set(task.id, goalId);
		settledGoalIds(task.subtasks, knownGoalIds, goalId, goalIdsByTask);
	}
	return goalIdsByTask;
}
