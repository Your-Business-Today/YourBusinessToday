import { fail } from '@sveltejs/kit';
import { findTaskOnProject, taskOnProjectRequired } from '$lib/server/projects/findTaskOnProject';
import { getPeopleOnProject } from '$lib/server/members/getPeopleOnProject';
import { readDay } from '$lib/data/days';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { setTaskAssignees } from '$lib/server/projects/setTaskAssignees';
import { setTaskDueDate } from '$lib/server/projects/setTaskDueDate';
import { todoActions } from './todoActions';
import type { Actions } from './$types';

const ownerOffProject = 'Only people on the project can own an item. Add them to the project first.';
const dueDateRefusal = 'A due date is a real day written YYYY-MM-DD.';

/** The changes made in place on a row of the Internal work board. Status and priority use the board's own actions. */
export const internalWorkActions = {
	setAssignees: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const task = await findTaskOnProject(locals.supabase, formData, params.projectId);
		if (task === null) return fail(400, { message: taskOnProjectRequired });
		const chosenIds = formData.getAll('assigneeId').map(String);
		const people = await getPeopleOnProject(locals.supabase, params.projectId);
		const peopleIds = people.map((person) => person.id);
		const isEveryoneOnProject = chosenIds.every((chosenId) => peopleIds.includes(chosenId));
		if (!isEveryoneOnProject) return fail(400, { message: ownerOffProject });
		await setTaskAssignees(locals.supabase, task.id, chosenIds);
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
