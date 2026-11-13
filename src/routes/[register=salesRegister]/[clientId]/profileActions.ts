import { parseCompanyProfileForm } from '$lib/server/clients/companyProfile';
import { fail } from '@sveltejs/kit';
import { validateCompanyProfileForm } from '$lib/server/clients/validateCompanyProfileForm';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { updateCompanyProfile } from '$lib/server/clients/updateCompanyProfile';
import type { Actions } from './$types';

export const profileActions: Actions = {
	updateProfile: async ({ locals, params, request }) => {
		await requireStaff(locals);
		const formData = await request.formData();
		const website = String(formData.get('website') ?? '').trim();
		const refusal = validateCompanyProfileForm(formData);
		if (refusal !== null) return fail(400, { message: refusal });
		const profile = parseCompanyProfileForm(formData);
		await updateCompanyProfile(locals.supabase, params.clientId, website, profile);
		return { message: 'Profile saved.' };
	}
};
