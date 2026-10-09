import { fail, redirect } from '@sveltejs/kit';
import { defaultSiteModel } from '$lib/data/siteModels';
import { displayNameMaxLength } from '$lib/data/displayNameRules';
import { getAdminPinnedModel } from '$lib/server/anthropic/getAdminPinnedModel';
import { getSiteModel } from '$lib/server/anthropic/getSiteModel';
import {
	getUserModelPreference,
	saveUserModelPreference
} from '$lib/server/anthropic/userModelPreference';
import { isLadderModel } from '$lib/data/modelLadder';
import { getDisplayName } from '$lib/server/auth/getDisplayName';
import { requireUser } from '$lib/server/auth/requireUser';
import { saveDisplayName } from '$lib/server/auth/saveDisplayName';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	await requireUser(locals);
	return {
		modelId: (await getUserModelPreference(locals.supabase)) ?? (await siteModelOrDefault()),
		adminPinnedModel: await getAdminPinnedModel(locals.supabase),
		displayName: await getDisplayName(locals.supabase)
	};
};

async function siteModelOrDefault(): Promise<string> {
	try {
		return await getSiteModel();
	} catch {
		return defaultSiteModel;
	}
}

export const actions: Actions = {
	saveModel: async ({ locals, request }) => {
		const user = await requireUser(locals);
		const formData = await request.formData();
		const modelId = String(formData.get('modelId') ?? '');
		if (!isLadderModel(modelId)) return fail(400, { message: 'Pick a model from the slider.' });
		await saveUserModelPreference(locals.supabase, user.id, modelId);
		return { message: 'Model saved.' };
	},
	signOut: async ({ locals }) => {
		const { auth } = locals.supabase;
		await auth.signOut();
		redirect(303, '/');
	},
	saveDisplayName: async ({ locals, request }) => {
		await requireUser(locals);
		const formData = await request.formData();
		const displayName = String(formData.get('displayName') ?? '').trim();
		if (displayName.length > displayNameMaxLength) {
			return fail(400, { message: `Display names are ${displayNameMaxLength} characters at most.` });
		}
		await saveDisplayName(locals.supabase, displayName);
		return { message: 'Profile saved.' };
	}
};
