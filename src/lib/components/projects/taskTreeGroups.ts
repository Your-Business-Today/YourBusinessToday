import { settledGoalIds } from '$lib/data/settledGoalIds';
import { tasksKeptWhere } from './taskTreeFilters';
import type { Goal } from '$lib/server/goals/goalRecord';
import type { TaskTreeNode } from '$lib/server/projects/buildTaskTree';

export type TaskGroup = { goal: Goal | null; tasks: TaskTreeNode[] };

type TaskTreeView = (taskTree: TaskTreeNode[]) => TaskTreeNode[];

const wholeTree: TaskTreeView = (taskTree) => taskTree;

/**
 * Every goal lists the tasks it counts, wherever they sit in the tree: a
 * subtask carrying another goal leaves its parent's list for its own, and a
 * subtask with no goal of its own stays with its parent. The view narrows
 * each group after it is formed, so a hidden parent never takes its goal with it.
 */
export function groupTasksByGoal(
	taskTree: TaskTreeNode[],
	goals: Goal[],
	narrowToVisible: TaskTreeView = wholeTree
): TaskGroup[] {
	const goalIdsByTask = settledGoalIds(taskTree, new Set(goals.map((goal) => goal.id)));
	const groupFor = (goal: Goal | null): TaskGroup => {
		const groupGoalId = goal === null ? null : goal.id;
		const isInGroup = (task: TaskTreeNode) => goalIdsByTask.get(task.id) === groupGoalId;
		return { goal, tasks: narrowToVisible(tasksKeptWhere(taskTree, isInGroup)) };
	};
	return [null, ...goals].map(groupFor).filter((group) => group.tasks.length > 0);
}
