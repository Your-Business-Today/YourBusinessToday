import type { SupabaseClient } from '@supabase/supabase-js';
import { createTask } from '$lib/server/projects/createTask';
import { setTaskAssignees } from '$lib/server/projects/setTaskAssignees';
import { isUniqueViolation } from './saveBoardroomRoom';
import { raisedFromWords, type RaisingOccasion } from '$lib/data/describeRaisedAction';
import { taskKinds } from '$lib/data/taskKind';
import type { ActionProject } from '$lib/data/boardroomAction';
import type { CarriedAction } from '$lib/data/carriedActions';

/** One action to make: the action with where it came from, and the id its task or to-do is made with. */
export type ActionToMake = { carried: CarriedAction; madeId: string };

async function makeTask(supabase: SupabaseClient, occasion: RaisingOccasion, toMake: ActionToMake, project: ActionProject): Promise<void> {
	const { action } = toMake.carried;
	const seed = {
		id: toMake.madeId,
		title: action.what,
		details: raisedFromWords(occasion, toMake.carried),
		dueDate: action.dueOn,
		parentTaskId: null,
		waitsForTaskId: null,
		goalId: null,
		kind: taskKinds.work,
		autocomplete: false,
		department: project.department
	};
	await createTask(supabase, project.projectId, seed, occasion.raisedBy);
	await setTaskAssignees(supabase, toMake.madeId, [action.ownerAccountId]);
}

async function makeTodo(supabase: SupabaseClient, occasion: RaisingOccasion, toMake: ActionToMake): Promise<void> {
	const { action } = toMake.carried;
	const row = {
		id: toMake.madeId,
		owner_account_id: action.ownerAccountId,
		title: action.what,
		notes: raisedFromWords(occasion, toMake.carried),
		due_date: action.dueOn,
		created_by: occasion.raisedBy
	};
	const { error } = await supabase.from('todos').insert(row);
	if (error) throw error;
}

/**
 * Makes the task or to-do an action was raised as, with the id its raising holds. A task goes on its project in
 * its department, assigned to its owner; an action with no project goes on its owner's own to-do list, written
 * through the service client after the director check, as the briefing to-dos are. One already made with that id
 * is left as it is.
 */
export async function makeRaisedAction(supabase: SupabaseClient, occasion: RaisingOccasion, toMake: ActionToMake): Promise<void> {
	const { carried } = toMake;
	const { project } = carried.action;
	try {
		if (project === null) return await makeTodo(supabase, occasion, toMake);
		return await makeTask(supabase, occasion, toMake, project);
	} catch (error) {
		if (isUniqueViolation(error as { code?: string })) return;
		throw error;
	}
}
