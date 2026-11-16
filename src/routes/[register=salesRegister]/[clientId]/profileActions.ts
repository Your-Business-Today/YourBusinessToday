import { fail } from '@sveltejs/kit';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { saveCompanyProfileForm } from '$lib/server/clients/saveCompanyProfileForm';
import type { Actions } from './$types';

const badRequest = 400;

export const profileActions: Actions = {
	updateProfile: async ({ locals, params, request }) => {
		const staffMember = await requireStaff(locals);
		const formData = await request.formData();
		const refusal = await saveCompanyProfileForm(locals.supabase, params.clientId, formData, staffMember.id);
		if (refusal !== null) return fail(badRequest, { message: refusal });
		return { message: 'Profile saved.' };
	}
};
