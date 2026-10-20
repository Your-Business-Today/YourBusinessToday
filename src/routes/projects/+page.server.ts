import { fail } from '@sveltejs/kit';
import { createProject } from '$lib/server/projects/createProject';
import { deleteProject } from '$lib/server/projects/deleteProject';
import { getLatestKitVersion } from '$lib/server/kit/kitVersions';
import { getAssignedTaskCounts } from '$lib/server/projects/getAssignedTaskCounts';
import { getOrganisations } from '$lib/server/organisations/getOrganisations';
import { getProjectsForOwner } from '$lib/server/projects/getProjectsForOwner';
import { getTeamProjects } from '$lib/server/members/getTeamProjects';
import { getTasksWaitingOnYou } from '$lib/server/conversations/getTasksWaitingOnYou';
import { parseRank } from '$lib/server/ordering/rankInput';
import { projectOrderActions } from './projectOrderActions';
import { readOrganisationChoice } from '$lib/server/organisations/organisationChoiceForm';
import { setProjectPosition } from '$lib/server/projects/projectShownOrder';
import { readShownIds, shownIdsField } from '$lib/data/shownIds';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { requireUser } from '$lib/server/auth/requireUser';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { readTeamChoiceFrom, teamProjectsAreForStaff } from '$lib/data/teamProject';
import { parseProjectDetailsForm } from '$lib/server/projects/projectDetailsForm';
import { saveProjectDetails } from '$lib/server/projects/saveProjectDetails';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireUser(locals);
	const assignedTaskCounts = await getAssignedTaskCounts(locals.supabase, user.id);
	return {
		waitingTasks: await getTasksWaitingOnYou(locals.supabase, user.id),
		projects: await getProjectsForOwner(locals.supabase, user.id, assignedTaskCounts),
		teamProjects: await getTeamProjects(locals.supabase, user.id, assignedTaskCounts),
		organisations: await getOrganisations(locals.supabase),
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
		const choice = readOrganisationChoice(formData, await getOrganisations(locals.supabase));
		if ('refusal' in choice) return fail(400, { message: choice.refusal });
		const isTeamProject = readTeamChoiceFrom(formData) === true;
		if (isTeamProject && !(await isStaffMember(locals)))
			return fail(400, { message: teamProjectsAreForStaff });
		await createProject(locals.supabase, {
			name,
			description,
			organisationId: choice.organisationId,
			isTeamProject,
			ownerId: user.id,
			createdBy: user.id
		});
		return { message: `Project "${name}" created.` };
	},
	updateProject: async ({ locals, request }) => {
		const formData = await request.formData();
		const projectId = String(formData.get('projectId') ?? '');
		if (projectId === '') return fail(400, { message: 'A project is required.' });
		const edit = parseProjectDetailsForm(formData);
		if ('refusal' in edit) return fail(400, { message: edit.refusal });
		const { update } = edit;
		const { user, project } = await requireProjectAccess(locals, projectId);
		const saveRefusal = await saveProjectDetails(locals, project, update, formData);
		if (saveRefusal !== null) return fail(400, { message: saveRefusal });
		const priority = parseRank(formData.get('priority'));
		const shownIds = readShownIds(formData.get(shownIdsField));
		if (priority !== null) await setProjectPosition(locals.supabase, projectId, priority, shownIds, user.id);
		return { message: `Project "${update.name}" saved.` };
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
