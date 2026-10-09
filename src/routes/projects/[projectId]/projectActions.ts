import { fail } from '@sveltejs/kit';
import { parseProjectDetailsForm, updateProjectDetails } from '$lib/server/projects/updateProjectDetails';
import { projectDatabaseRefusal } from '$lib/data/projectDatabase';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions } from './$types';

export const projectActions = {
	updateProject: async ({ locals, params, request }) => {
		await requireProjectAccess(locals, params.projectId);
		const edit = parseProjectDetailsForm(await request.formData());
		if (edit === null) return fail(400, { message: 'A project name is required.' });
		const databaseRefusal = projectDatabaseRefusal(edit.database);
		if (databaseRefusal !== null) return fail(400, { message: databaseRefusal });
		await updateProjectDetails(locals.supabase, params.projectId, edit);
		return { message: `Project "${edit.name}" saved.` };
	}
} satisfies Actions;
