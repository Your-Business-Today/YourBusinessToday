import type { SupabaseClient } from '@supabase/supabase-js';
import { siblingsOf } from '$lib/server/projects/taskSiblings';
import { getTask } from '$lib/server/projects/getTask';
import { placeBeside } from '$lib/server/ordering/rankedScope';
import { reparentTask } from '$lib/server/projects/reparentTask';
import { updateTaskGoal } from '$lib/server/projects/updateTaskGoal';
import type { BesidePlacement } from '$lib/server/ordering/rankedSet';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

/** The moved task as it was and as it is now, so the caller can say everything that changed. */
export type TaskPlacement = { isPlaced: boolean; taskBefore: ProjectTask; taskAfter: ProjectTask };

/**
 * Ordering a task changes its order. A subtask is ordered among its parent's
 * subtasks, so a task placed beside one under another parent joins that parent.
 * Top level tasks are one sibling group for the whole project, whatever their
 * goal, so the moved task keeps its goal unless the caller asks it to join the
 * target's. Nothing else is changed when the parent cannot be joined.
 */
export async function placeTask(
	supabase: SupabaseClient,
	taskBefore: ProjectTask,
	targetTask: ProjectTask,
	placement: BesidePlacement,
	shouldJoinTargetGoal: boolean
): Promise<TaskPlacement> {
	await reparentTask(supabase, taskBefore.id, targetTask.parentTaskId);
	const taskBesideTarget = (await getTask(supabase, taskBefore.id)) ?? taskBefore;
	const isUnderTargetParent = taskBesideTarget.parentTaskId === targetTask.parentTaskId;
	if (!isUnderTargetParent) return { isPlaced: false, taskBefore, taskAfter: taskBesideTarget };
	if (shouldJoinTargetGoal && taskBesideTarget.goalId !== targetTask.goalId) {
		await updateTaskGoal(supabase, taskBefore.id, targetTask.goalId);
	}
	const siblings = siblingsOf(supabase, taskBesideTarget);
	const isPlaced = await placeBeside(siblings, taskBefore.id, targetTask.id, placement);
	const taskAfter = (await getTask(supabase, taskBefore.id)) ?? taskBesideTarget;
	return { isPlaced, taskBefore, taskAfter };
}
