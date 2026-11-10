import type { SupabaseClient } from '@supabase/supabase-js';
import { getGoal } from '$lib/server/goals/getGoal';
import { getTask } from '$lib/server/projects/getTask';
import type { BesidePlacement } from '$lib/server/ordering/rankedSet';
import type { NamedMove, PlacementStory } from './describeTaskPlacement';
import type { ProjectTask } from '$lib/server/projects/taskRecord';
import type { TaskPlacement } from '$lib/server/projects/placeTask';

/** What a placement changed, with each goal and parent named, ready to be told. */
export async function placementStory(
	supabase: SupabaseClient,
	placed: TaskPlacement,
	targetTask: ProjectTask,
	placement: BesidePlacement
): Promise<PlacementStory> {
	const { taskBefore, taskAfter } = placed;
	const isParentChanged = taskBefore.parentTaskId !== taskAfter.parentTaskId;
	const isGoalChanged = taskBefore.goalId !== taskAfter.goalId;
	const isTargetTopLevel = targetTask.parentTaskId === null;
	const isGoalKeptBesideAnother = isTargetTopLevel && taskAfter.goalId !== targetTask.goalId;
	const parentMove = isParentChanged ? await parentNames(supabase, taskBefore, taskAfter) : null;
	const goalMove = isGoalChanged ? await goalNames(supabase, taskBefore, taskAfter) : null;
	const goalKeptBesideAnother = isGoalKeptBesideAnother
		? await goalNames(supabase, taskAfter, targetTask)
		: null;
	return {
		taskTitle: taskAfter.title,
		targetTitle: targetTask.title,
		placement,
		parentMove,
		goalMove,
		goalKeptBesideAnother
	};
}

async function parentNames(
	supabase: SupabaseClient,
	from: ProjectTask,
	to: ProjectTask
): Promise<NamedMove> {
	return {
		leftName: await parentTitle(supabase, from.parentTaskId),
		joinedName: await parentTitle(supabase, to.parentTaskId)
	};
}

async function goalNames(
	supabase: SupabaseClient,
	from: ProjectTask,
	to: ProjectTask
): Promise<NamedMove> {
	return {
		leftName: await goalTitle(supabase, from.goalId),
		joinedName: await goalTitle(supabase, to.goalId)
	};
}

async function parentTitle(supabase: SupabaseClient, parentTaskId: string | null): Promise<string | null> {
	if (parentTaskId === null) return null;
	const parent = await getTask(supabase, parentTaskId);
	return parent?.title ?? null;
}

async function goalTitle(supabase: SupabaseClient, goalId: string | null): Promise<string | null> {
	if (goalId === null) return null;
	const goal = await getGoal(supabase, goalId);
	return goal?.title ?? null;
}
