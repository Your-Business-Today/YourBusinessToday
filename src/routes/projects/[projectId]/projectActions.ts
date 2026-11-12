import { fail } from '@sveltejs/kit';
import { parseProjectDetailsForm } from '$lib/server/projects/projectDetailsForm';
import { saveProjectDetails } from '$lib/server/projects/saveProjectDetails';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import type { Actions } from './$types';

export const projectActions = {
	updateProject: async ({ locals, params, request }) => {
		const { project } = await requireProjectAccess(locals, params.projectId);
		const formData = await request.formData();
		const edit = parseProjectDetailsForm(formData);
		if ('refusal' in edit) return fail(400, { message: edit.refusal });
		const { update } = edit;
		const saveRefusal = await saveProjectDetails(locals, project, update, formData);
		if (saveRefusal !== null) return fail(400, { message: saveRefusal });
		return { message: `Project "${update.name}" saved.` };
	}
} satisfies Actions;
