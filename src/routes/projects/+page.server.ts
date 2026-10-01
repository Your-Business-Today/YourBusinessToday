import { fail } from '@sveltejs/kit';
import { createProject } from '$lib/server/projects/createProject';
import { deleteProject } from '$lib/server/projects/deleteProject';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { getAssignedTaskCounts } from '$lib/server/projects/getAssignedTaskCounts';
import { getProjectList } from '$lib/server/projects/getProjectList';
import { getTeamProjects } from '$lib/server/members/getTeamProjects';
import { parseRank } from '$lib/server/ordering/rankInput';
import { projectOrderActions } from './projectOrderActions';
import { setProjectPriority } from '$lib/server/projects/setProjectPriority';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { requireUser } from '$lib/server/auth/requireUser';
import { readProjectDetailsForm, updateProjectDetails } from '$lib/server/projects/updateProjectDetails';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	const assignedTaskCounts = await getAssignedTaskCounts(locals.supabase, user.id);
	return {
		projects: await getProjectList(locals.supabase, user.id, assignedTaskCounts),
		teamProjects: await getTeamProjects(locals.supabase, user.id, assignedTaskCounts),
		latestKitVersion: await getLatestKitVersion(locals.supabase)
	};
};

export const actions: Actions = {
	...projectOrderActions,
	createProject: async ({ locals, request }) => {
		const user = await requireUser(locals);
		const formData = await request.formData();
		const name = String(formData.get('name') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();
		if (name === '') return fail(400, { message: 'A project name is required.' });
		await createProject(locals.supabase, {
			name,
			description,
			ownerId: user.id,
			createdBy: user.id
		});
		return { message: `Project "${name}" created.` };
	},
	updateProject: async ({ locals, request }) => {
		const formData = await request.formData();
		const projectId = String(formData.get('projectId') ?? '');
		const edit = readProjectDetailsForm(formData);
		if (projectId === '' || edit === null) {
			return fail(400, { message: 'A project and a name are required.' });
		}
		const { user } = await requireProjectAccess(locals, projectId);
		await updateProjectDetails(locals.supabase, projectId, edit);
		const priority = parseRank(formData.get('priority'));
		if (priority !== null) await setProjectPriority(locals.supabase, projectId, priority, user.id);
		return { message: `Project "${edit.name}" saved.` };
	},
	deleteProject: async ({ locals, request }) => {
		const formData = await request.formData();
		const projectId = String(formData.get('projectId') ?? '');
		if (projectId === '') return fail(400, { message: 'A project is required.' });
		await requireProjectAccess(locals, projectId);
		await deleteProject(locals.supabase, projectId);
		return { message: 'Project deleted.' };
	}
};
