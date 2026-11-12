import { fail } from '@sveltejs/kit';
import { requireProjectAccess } from '$lib/server/auth/requireProjectAccess';
import { deployStagingNow } from '$lib/server/deployWindows/deployStagingNow';
import { describePromotion, noRepositoryToDeploy } from '$lib/server/deployWindows/promotionSentence';
import { deployWindowOutcomes } from '$lib/data/deployWindow';
import { getCurrentAccount } from '$lib/server/accounts/getCurrentAccount';
import type { Actions } from './$types';

export const deployActions = {
	deployNow: async ({ locals, params }) => {
		const { project, user } = await requireProjectAccess(locals, params.projectId);
		if (project.repositoryUrl === '') return fail(400, { message: noRepositoryToDeploy });
		const account = await getCurrentAccount(locals.supabase, user);
		const promotion = await deployStagingNow(locals.supabase, project, account.name);
		if (promotion.outcome === deployWindowOutcomes.failed) return fail(400, { message: promotion.note });
		return { message: describePromotion(promotion) };
	}
} satisfies Actions;
