import { fail, redirect } from '@sveltejs/kit';
import { displayNameMaxLength } from '$lib/data/displayNameRules';
import { getDisplayName } from '$lib/server/auth/getDisplayName';
import { requireUser } from '$lib/server/auth/requireUser';
import { saveDisplayName } from '$lib/server/auth/saveDisplayName';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	await requireUser(locals);
	return {
		displayName: await getDisplayName(locals.supabase)
	};
};

export const actions: Actions = {
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
