import { fail } from '@sveltejs/kit';
import { buildModelActions } from './buildModelActions';
import { deleteUserAccount } from '$lib/server/admin/deleteUserAccount';
import { getAdminUserList } from '$lib/server/admin/getAdminUserList';
import { getBuildModelSettings } from '$lib/server/buildModels/getBuildModelSettings';
import { passwordActions } from './passwordActions';
import { requireAdmin } from '$lib/server/admin/requireAdmin';
import { setAccountRestriction } from '$lib/server/admin/setAccountRestriction';
import { setStaffAccess } from '$lib/server/admin/setStaffAccess';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	await requireAdmin(locals);
	return {
		users: await getAdminUserList(locals.supabase),
		buildModels: await getBuildModelSettings(locals.supabase)
	};
};

export const actions: Actions = {
	...passwordActions,
	...buildModelActions,
	setRestriction: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const targetEmail = String(formData.get('targetEmail') ?? '');
		const shouldRestrict = String(formData.get('shouldRestrict')) === 'true';
		if (targetEmail === '') return fail(400, { message: 'A user is required.' });
		await setAccountRestriction(locals.supabase, targetEmail, shouldRestrict);
		const restrictionState = shouldRestrict ? 'restricted' : 'unrestricted';
		return { message: `${targetEmail} is now ${restrictionState}.` };
	},
	setStaff: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const targetEmail = String(formData.get('targetEmail') ?? '');
		const shouldBeStaff = String(formData.get('shouldBeStaff')) === 'true';
		if (targetEmail === '') return fail(400, { message: 'A user is required.' });
		await setStaffAccess(locals.supabase, targetEmail, shouldBeStaff);
		const staffState = shouldBeStaff ? 'now staff' : 'no longer staff';
		return { message: `${targetEmail} is ${staffState}.` };
	},
	deleteUser: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const targetEmail = String(formData.get('targetEmail') ?? '');
		if (targetEmail === '') return fail(400, { message: 'A user is required.' });
		try {
			await deleteUserAccount(locals.supabase, targetEmail);
		} catch {
			return fail(400, {
				message: `${targetEmail} could not be deleted — admin accounts and accounts that own team data are protected.`
			});
		}
		return { message: `${targetEmail} has been deleted.` };
	}
};
