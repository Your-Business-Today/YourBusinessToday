import { fail } from '@sveltejs/kit';
import { assignTaskOnProject, assigneeOffProject } from '$lib/server/projects/assignTaskOnProject';
import { getReachableProjectsOf } from '$lib/server/organisations/getReachableProjectsOf';
import { getTask } from '$lib/server/projects/getTask';
import { isUuid } from '$lib/data/isUuid';
import { requireOrganisationAccess } from '$lib/server/auth/requireOrganisationAccess';
import type { Actions } from './$types';
import type { ProjectTask } from '$lib/server/projects/taskRecord';

const jobOnOrganisationRequired = 'A job on one of this organisation’s products is required.';

/** The changes made in place on a row of the organisation's Tasks page. */
export const teamWorkActions = {
	setAssignees: async ({ locals, params, request }) => {
		const { user, organisation } = await requireOrganisationAccess(locals, params.organisationId);
		const formData = await request.formData();
		const taskId = String(formData.get('taskId') ?? '');
		const task = isUuid(taskId) ? await getTask(locals.supabase, taskId) : null;
		const products = await getReachableProjectsOf(locals.supabase, user.id, organisation.id);
		if (!isOnProducts(task, products)) return fail(400, { message: jobOnOrganisationRequired });
		const chosenIds = formData.getAll('assigneeId').map(String);
		const isAssigned = await assignTaskOnProject(locals.supabase, task, chosenIds);
		if (!isAssigned) return fail(400, { message: assigneeOffProject });
		return {};
	}
} satisfies Actions;

function isOnProducts(task: ProjectTask | null, products: { id: string }[]): task is ProjectTask {
	if (task === null) return false;
	return products.some((product) => product.id === task.projectId);
}
