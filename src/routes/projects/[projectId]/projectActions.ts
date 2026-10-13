import { fail } from '@sveltejs/kit';
import { parseProjectDetailsForm } from '$lib/server/projects/updateProjectDetails';
import { saveProjectDetails } from '$lib/server/projects/saveProjectDetails';
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
		const saveRefusal = await saveProjectDetails(locals, project, edit, formData);
		if (saveRefusal !== null) return fail(400, { message: saveRefusal });
		return { message: `Project "${edit.name}" saved.` };
	}
} satisfies Actions;
