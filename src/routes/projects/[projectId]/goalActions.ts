import { fail } from '@sveltejs/kit';
import { createGoal, readNewGoalSeed } from '$lib/server/goals/createGoal';
import { deleteGoal } from '$lib/server/goals/deleteGoal';
import { getGoal } from '$lib/server/goals/getGoal';
import { isUuid } from '$lib/data/isUuid';
import { moveGoal } from '$lib/server/goals/moveGoal';
import {
	parseDropPlacement,
	parseMoveDirection,
	parsePriorityNumber,
	priorityNumberRefusal
} from '$lib/server/ordering/rankInput';
import { placeGoal } from '$lib/server/goals/placeGoal';
import { setGoalPriority } from '$lib/server/goals/setGoalPriority';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions } from './$types';
import type { SupabaseClient } from '@supabase/supabase-js';

const goalRequired = 'A goal on this project is required.';

export const goalActions = {
	createGoal: async ({ locals, params, request }) => {
		const { user } = await requireProjectAccess(locals, params.projectId);
		const seed = readNewGoalSeed(await request.formData());
		if (seed === null) return fail(400, { message: 'A goal needs a title.' });
		await createGoal(locals.supabase, params.projectId, seed, user.id);
		return { message: `Goal "${seed.title}" added.` };
	},
	deleteGoal: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const goalId = String((await request.formData()).get('goalId') ?? '');
		if (goalId === '') return fail(400, { message: 'A goal is required.' });
		await deleteGoal(locals.supabase, goalId);
		return {};
	},
	moveGoal: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const goalId = String(formData.get('goalId') ?? '');
		const direction = parseMoveDirection(formData.get('direction'));
		const isOnProject = await isGoalOnProject(locals.supabase, goalId, params.projectId);
		if (!isOnProject || direction === null) return fail(400, { message: goalRequired });
		await moveGoal(locals.supabase, goalId, direction);
		return {};
	},
	placeGoal: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const movedGoalId = String(formData.get('movedGoalId') ?? '');
		const targetGoalId = String(formData.get('targetGoalId') ?? '');
		const isOnProject = await isGoalOnProject(locals.supabase, movedGoalId, params.projectId);
		if (!isOnProject || targetGoalId === '') return fail(400, { message: goalRequired });
		const placement = parseDropPlacement(formData.get('placement'));
		await placeGoal(locals.supabase, movedGoalId, targetGoalId, placement);
		return {};
	},
	setGoalPriority: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const goalId = String(formData.get('goalId') ?? '');
		const isOnProject = await isGoalOnProject(locals.supabase, goalId, params.projectId);
		if (!isOnProject) return fail(400, { message: goalRequired });
		const priority = parsePriorityNumber(formData.get('priority'));
		if (priority === null) return fail(400, { message: priorityNumberRefusal });
		await setGoalPriority(locals.supabase, goalId, priority);
		return {};
	}
} satisfies Actions;

async function isGoalOnProject(
	supabase: SupabaseClient,
	goalId: string,
	projectId: string
): Promise<boolean> {
	if (!isUuid(goalId)) return false;
	const goal = await getGoal(supabase, goalId);
	return goal?.projectId === projectId;
}
