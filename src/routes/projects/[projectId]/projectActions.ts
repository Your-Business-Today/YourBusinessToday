import { fail } from '@sveltejs/kit';
import { changeProjectOrganisation } from '$lib/server/organisations/changeProjectOrganisation';
import { changeTeamProject } from '$lib/server/projects/changeTeamProject';
import { isStaffMember } from '$lib/server/auth/requireOrganisationAccess';
import { parseProjectDetailsForm, updateProjectDetails } from '$lib/server/projects/updateProjectDetails';
import { projectDatabaseRefusal } from '$lib/data/projectDatabase';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions } from './$types';

export const projectActions = {
	updateProject: async ({ locals, params, request }) => {
		const { project } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const edit = parseProjectDetailsForm(formData);
		if (edit === null) return fail(400, { message: 'A project name is required.' });
		const databaseRefusal = projectDatabaseRefusal(edit.database);
		if (databaseRefusal !== null) return fail(400, { message: databaseRefusal });
		await updateProjectDetails(locals.supabase, params.projectId, edit);
		const organisationRefusal = await changeProjectOrganisation(locals.supabase, project, formData);
		if (organisationRefusal !== null) return fail(400, { message: organisationRefusal });
		const teamRefusal = await changeTeamProject(locals.supabase, project, formData, await isStaffMember(locals));
		if (teamRefusal !== null) return fail(400, { message: teamRefusal });
		return { message: `Project "${edit.name}" saved.` };
	}
} satisfies Actions;
