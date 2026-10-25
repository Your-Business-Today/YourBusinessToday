import { fail } from '@sveltejs/kit';
import { parseProjectDetailsForm } from '$lib/server/projects/projectDetailsForm';
import { saveProjectDetails } from '$lib/server/projects/saveProjectDetails';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { deployStagingNow } from '$lib/server/deployWindows/deployStagingNow';
import { describePromotion, noRepositoryToDeploy } from '$lib/server/deployWindows/promotionSentence';
import { deployWindowOutcomes } from '$lib/data/deployWindow';
import { getCurrentAccount } from '$lib/server/accounts/getCurrentAccount';
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
	},
	deployNow: async ({ locals, params }) => {
		const { project, user } = await requireProjectAccess(locals, params.projectId);
		if (project.repositoryUrl === '') return fail(400, { message: noRepositoryToDeploy });
		const account = await getCurrentAccount(locals.supabase, user);
		const promotion = await deployStagingNow(locals.supabase, project, account.name);
		if (promotion.outcome === deployWindowOutcomes.failed) return fail(400, { message: promotion.note });
		return { message: describePromotion(promotion) };
	}
} satisfies Actions;
