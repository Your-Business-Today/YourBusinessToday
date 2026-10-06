import { fail } from '@sveltejs/kit';
import { problemWithPassword } from '$lib/server/auth/passwordRules';
import { requireAdmin } from '$lib/server/admin/requireAdmin';
import {
	sendUserPasswordReset,
	type PasswordResetOutcome
} from '$lib/server/admin/sendUserPasswordReset';
import { setUserPassword } from '$lib/server/admin/setUserPassword';
import type { Actions } from './$types';
import { emailDeliveries } from '$lib/data/emailDelivery';

const badRequestStatus = 400;
const userRequired = 'A user is required.';

const resetOutcomeMessages: Record<PasswordResetOutcome, string> = {
	sent: 'has been emailed a link to set a new password.',
	skipped: 'was not emailed — email is not configured.',
	failed: 'could not be emailed — try again later, or set a password for them.',
	no_account: 'has no account here.'
};

export const passwordActions: Actions = {
	sendPasswordReset: async ({ locals, request, url }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const targetEmail = String(formData.get('targetEmail') ?? '');
		if (targetEmail === '') return fail(badRequestStatus, { message: userRequired });
		const outcome = await sendUserPasswordReset(targetEmail, url.origin);
		const message = `${targetEmail} ${resetOutcomeMessages[outcome]}`;
		if (outcome === emailDeliveries.sent) return { message };
		return fail(badRequestStatus, { message });
	},
	setPassword: async ({ locals, request }) => {
		await requireAdmin(locals);
		const formData = await request.formData();
		const targetEmail = String(formData.get('targetEmail') ?? '');
		const password = String(formData.get('password') ?? '');
		if (targetEmail === '') return fail(badRequestStatus, { message: userRequired });
		const inputProblem = problemWithPassword(password);
		if (inputProblem !== null) return fail(badRequestStatus, { message: inputProblem });
		const savingProblem = await setUserPassword(targetEmail, password);
		if (savingProblem !== null) return fail(badRequestStatus, { message: savingProblem });
		return {
			message: `${targetEmail} now has the password you set — pass it on to them.`
		};
	}
};
