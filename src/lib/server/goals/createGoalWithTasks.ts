import { createGoal, type NewGoalSeed } from './createGoal';
import { deleteGoal } from './deleteGoal';
import { createTask, type NewTaskSeed } from '$lib/server/projects/createTask';
import { deleteTask } from '$lib/server/projects/deleteTask';
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
	try {
		for (const task of tasks) {
			const seed = { ...task, goalId, department: goal.department };
			taskIds.push(await createTask(supabase, projectId, seed, createdBy));
		}
		return { goalId, taskIds };
	} catch (failure) {
		await undoRaisedGoal(supabase, { goalId, taskIds });
		throw failure;
	}
}

async function undoRaisedGoal(supabase: SupabaseClient, raised: RaisedGoal): Promise<void> {
	for (const taskId of raised.taskIds) await deleteTask(supabase, taskId);
	await deleteGoal(supabase, raised.goalId);
}
