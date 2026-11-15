import { fail } from '@sveltejs/kit';
import { isUuid } from '$lib/data/isUuid';
import { readDeletedTasks } from '$lib/server/projects/readDeletedTasks';
import { findTaskDeletion } from '$lib/server/projects/taskDeletionReading';
import { putBackDeletedTask } from '$lib/server/projects/putBackDeletedTask';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { deletedTaskInputs } from '$lib/data/deletedTask';
import type { Actions, PageServerLoad } from './$types';

const noSuchDeletion =
	'That task is not on this project’s record of deletions. Reload the page to see the list as it is now.';

export const load: PageServerLoad = async ({ locals, params }) => {
	const { project } = await requireProjectAccess(locals, params.projectId);
	return { project, deletedTasks: await readDeletedTasks(supabaseServiceClient(), project.id) };
};

export const actions = {
	putBack: async ({ locals, params, request }) => {
		const { user, project } = await requireProjectAccess(locals, params.projectId);
		const deletionId = String((await request.formData()).get(deletedTaskInputs.deletionId) ?? '');
		if (!isUuid(deletionId)) return fail(400, { message: noSuchDeletion });
		const serviceSupabase = supabaseServiceClient();
		const deletion = await findTaskDeletion(serviceSupabase, deletionId);
		if (deletion === null || deletion.projectId !== project.id) return fail(400, { message: noSuchDeletion });
		const outcome = await putBackDeletedTask(serviceSupabase, deletion.id, user.id);
		if (outcome.refusal !== null) return fail(400, { message: outcome.refusal });
		return {};
	}
} satisfies Actions;
