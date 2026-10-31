import { fail } from '@sveltejs/kit';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { recordContinuityCopy } from '$lib/server/clients/recordContinuityCopy';
import { validateContinuityCopy } from '$lib/data/continuityCopy';
import { ukClockAt } from '$lib/data/ukClock';
import type { Actions } from './$types';

export const continuityCopyActions: Actions = {
	recordContinuityCopy: async ({ locals, params, request }) => {
		await requireStaff(locals);
		const fields = Object.fromEntries(await request.formData());
		const { date: today } = ukClockAt(new Date());
		const continuityCopy = validateContinuityCopy(fields, today);
		if (typeof continuityCopy === 'string') return fail(400, { message: continuityCopy });
		await recordContinuityCopy(locals.supabase, params.clientId, continuityCopy);
		return { message: 'Continuity copy recorded.' };
	}
};
