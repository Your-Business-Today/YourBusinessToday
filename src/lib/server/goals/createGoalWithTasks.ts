import { createGoal, type NewGoalSeed } from './createGoal';
import { deleteGoal } from './deleteGoal';
import { createTaskWithSubtasks } from '$lib/server/projects/createTaskWithSubtasks';
import type { NewTaskSeed } from '$lib/server/projects/createTask';
import { deleteTasksTogether } from '$lib/server/projects/deleteTasksTogether';
import type { SupabaseClient } from '@supabase/supabase-js';

export type RaisedGoal = { goalId: string; taskIds: string[] };

/**
 * Raise a goal and its first tasks as one: if any task fails, what was already made is
 * deleted again, so a goal never stands without the tasks it was raised with.
 */
export async function createGoalWithTasks(
	supabase: SupabaseClient,
	projectId: string,
	goal: NewGoalSeed,
	tasks: NewTaskSeed[],
	createdBy: string
): Promise<RaisedGoal> {
	const goalId = await createGoal(supabase, projectId, goal, createdBy);
	const taskIds: string[] = [];
	const raisedIds: string[] = [];
	try {
		for (const task of tasks) {
			const seed = { ...task, goalId, department: goal.department };
			const family = await createTaskWithSubtasks(supabase, projectId, seed, createdBy);
			taskIds.push(family.taskId);
			raisedIds.push(family.taskId, ...family.subtaskIds);
		}
		return { goalId, taskIds };
	} catch (failure) {
		await deleteTasksTogether(supabase, { projectId, taskIds: raisedIds, deletedByAccountId: createdBy });
		await deleteGoal(supabase, goalId);
		throw failure;
	}
}
