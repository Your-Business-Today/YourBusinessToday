import { fail } from '@sveltejs/kit';
import { findTaskOnProject, taskOnProjectRequired } from '$lib/server/projects/findTaskOnProject';
import { assignTaskOnProject, assigneeOffProject } from '$lib/server/projects/assignTaskOnProject';
import { readDay } from '$lib/data/days';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { setTaskDueDate } from '$lib/server/projects/setTaskDueDate';
import { todoActions } from './todoActions';
import type { Actions } from './$types';

const dueDateRefusal = 'A due date is a real day written YYYY-MM-DD.';

/** The changes made in place on a row of the Internal work board. Status and priority use the board's own actions. */
export const internalWorkActions = {
	setAssignees: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const task = await findTaskOnProject(locals.supabase, formData, params.projectId);
		if (task === null) return fail(400, { message: taskOnProjectRequired });
		const chosenIds = formData.getAll('assigneeId').map(String);
		const isAssigned = await assignTaskOnProject(locals.supabase, task, chosenIds);
		if (!isAssigned) return fail(400, { message: assigneeOffProject });
		return {};
	},
	setDueDate: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const task = await findTaskOnProject(locals.supabase, formData, params.projectId);
		if (task === null) return fail(400, { message: taskOnProjectRequired });
		const dueDate = readDay(formData.get('dueDate'));
		if (dueDate === undefined) return fail(400, { message: dueDateRefusal });
		await setTaskDueDate(locals.supabase, task.id, dueDate);
		return {};
	},
	...todoActions
} satisfies Actions;
