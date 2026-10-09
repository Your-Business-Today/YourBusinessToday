import { parseCompanyProfileForm } from '$lib/server/clients/companyProfile';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { updateCompanyProfile } from '$lib/server/clients/updateCompanyProfile';
import type { Actions } from './$types';

export const profileActions: Actions = {
	updateProfile: async ({ locals, params, request }) => {
		await requireStaff(locals);
		const formData = await request.formData();
		const website = String(formData.get('website') ?? '').trim();
		const profile = parseCompanyProfileForm(formData);
		await updateCompanyProfile(locals.supabase, params.clientId, website, profile);
		return { message: 'Profile saved.' };
	}
};
