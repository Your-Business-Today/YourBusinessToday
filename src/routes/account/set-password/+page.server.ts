import { fail, redirect } from '@sveltejs/kit';
import { problemWithNewPassword } from '$lib/server/auth/passwordRules';
import { requireUser } from '$lib/server/auth/requireUser';
import { setAccountPassword } from '$lib/server/auth/setAccountPassword';
import {
	destinationAfterSettingPassword,
	nextDestinationField,
	readNextDestination
} from '$lib/server/auth/setPasswordDestination';
import type { Actions, PageServerLoad } from './$types';

const badRequestStatus = 400;

export const load: PageServerLoad = async ({ locals, url }) => {
	const user = await requireUser(locals);
	const nextDestination = readNextDestination(url.searchParams.get(nextDestinationField));
	return { emailAddress: user.email ?? '', nextDestination };
};

export const actions: Actions = {
	setPassword: async ({ locals, request }) => {
		const user = await requireUser(locals);
		const formData = await request.formData();
		const password = String(formData.get('password') ?? '');
		const confirmation = String(formData.get('confirmation') ?? '');
		const inputProblem = problemWithNewPassword(password, confirmation);
		if (inputProblem !== null) return fail(badRequestStatus, { message: inputProblem });
		const savingProblem = await setAccountPassword(locals.supabase, password);
		if (savingProblem !== null) return fail(badRequestStatus, { message: savingProblem });
		const nextDestination = readNextDestination(String(formData.get(nextDestinationField) ?? ''));
		redirect(303, await destinationAfterSettingPassword(locals.supabase, user.id, nextDestination));
	}
};
