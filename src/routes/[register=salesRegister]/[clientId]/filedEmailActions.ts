import { fail } from '@sveltejs/kit';
import { requireStaff } from '$lib/server/auth/requireStaff';
import { unfileEmail } from '$lib/server/filedEmails/unfileEmail';
import { validateRecordId } from '$lib/data/isUuid';
import type { Actions } from './$types';

const badRequest = 400;
const notFound = 404;

export const filedEmailActions: Actions = {
	unfileEmail: async ({ locals, request }) => {
		await requireStaff(locals);
		const formData = await request.formData();
		const filedEmailId = String(formData.get('filedEmailId') ?? '').trim();
		const idRefusal = validateRecordId('filedEmailId', filedEmailId);
		if (idRefusal !== null) return fail(badRequest, { message: idRefusal });
		const unfiled = await unfileEmail(locals.supabase, filedEmailId);
		if (unfiled === null) return fail(notFound, { message: 'That email was not filed here, or has been taken off already.' });
		return { message: 'Email taken off this company. It is still in Gmail.' };
	}
};
