import { fail, type ActionFailure } from '@sveltejs/kit';
import { autocompleteChoiceRefusal, validateAutocompleteChoice } from '$lib/data/autocomplete';
import { findTaskOnProject, taskOnProjectRequired } from '$lib/server/projects/findTaskOnProject';
import { setGoalAutocomplete } from '$lib/server/goals/setGoalAutocomplete';
import { setTaskAutocomplete } from '$lib/server/projects/setTaskAutocomplete';
import { getGoal } from '$lib/server/goals/getGoal';
import {
	canChooseTaskAutocomplete,
	canSwitchGoalAutocomplete,
	staffOnlyAutocompleteRefusal
} from '$lib/data/autocompleteStanding';
import type { SupabaseClient } from '@supabase/supabase-js';

type FormAnswer = ActionFailure<{ message: string }> | { message?: string };

/** A task card's or a task page's autocomplete choice, for a task on the given project. */
export async function setTaskAutocompleteFromForm(
	supabase: SupabaseClient,
	projectId: string,
	formData: FormData,
	isStaff: boolean
): Promise<FormAnswer> {
	const task = await findTaskOnProject(supabase, formData, projectId);
	if (task === null) return fail(400, { message: taskOnProjectRequired });
	const setting = validateAutocompleteChoice(formData.get('autocomplete'));
	if (setting === undefined) return fail(400, { message: autocompleteChoiceRefusal });
	if (!canChooseTaskAutocomplete(setting, isStaff)) return fail(403, { message: staffOnlyAutocompleteRefusal });
	await setTaskAutocomplete(supabase, task.id, setting);
	return {};
}

/** A goal page's autocomplete switch, for a goal on the given project. */
export async function setGoalAutocompleteFromForm(
	supabase: SupabaseClient,
	projectId: string,
	goalId: string,
	formData: FormData,
	isStaff: boolean
): Promise<FormAnswer> {
	const goal = await getGoal(supabase, goalId);
	if (goal === null || goal.projectId !== projectId) {
		return fail(400, { message: 'A goal on this project is required.' });
	}
	const isAutocomplete = formData.get('isAutocomplete') === 'true';
	if (!canSwitchGoalAutocomplete(isAutocomplete, isStaff)) return fail(403, { message: staffOnlyAutocompleteRefusal });
	await setGoalAutocomplete(supabase, goal.id, isAutocomplete);
	const word = isAutocomplete ? 'on' : 'off';
	return { message: `Autocomplete is ${word} for this goal and every task that follows it.` };
}
