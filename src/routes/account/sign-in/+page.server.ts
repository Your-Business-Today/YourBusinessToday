import { fail, redirect } from '@sveltejs/kit';
import { beginGoogleSignIn } from '$lib/server/auth/beginGoogleSignIn';
import { createAccountWithPassword } from '$lib/server/auth/createAccountWithPassword';
import { readEmailAndPassword } from '$lib/server/auth/emailAndPassword';
import { destinationAfterSignIn } from '$lib/server/auth/destinationAfterSignIn';
import { problemWithCredentials, problemWithEmailAddress } from '$lib/server/auth/passwordRules';
import { sendUserPasswordReset } from '$lib/server/admin/sendUserPasswordReset';
import { emailSendAllowance, tooManyEmailsMessage } from '$lib/server/auth/emailSendAllowance';
import { signInWithPassword } from '$lib/server/auth/signInWithPassword';
import type { Actions, PageServerLoad } from './$types';

const badRequestStatus = 400;
const confirmationEmailSent = 'Check your inbox — we have sent a link to confirm your address.';
const resetEmailSent = 'If that address has an account, a reset link is on its way.';

export const load: PageServerLoad = async ({ locals, url }) => {
	const { user } = await locals.safeGetSession();
	if (user !== null) {
		const destination = await destinationAfterSignIn(locals, url.searchParams.get('next'));
		redirect(303, destination);
	}
	return {
		isInvited: url.searchParams.get('invited') === '1',
		invitedBy: url.searchParams.get('by') ?? '',
		next: url.searchParams.get('next') ?? ''
	};
};

function readDestination(formData: FormData): string | null {
	const next = String(formData.get('next') ?? '');
	if (next === '') return null;
	return next;
}

function problemResponse(message: string, emailAddress: string) {
	return fail(badRequestStatus, { message, isProblem: true, emailAddress });
}

function noticeResponse(message: string, emailAddress: string) {
	return { message, isProblem: false, emailAddress };
}

export const actions: Actions = {
	signInWithGoogle: async ({ locals, url, request }) => {
		const destination = readDestination(await request.formData());
		redirect(303, await beginGoogleSignIn(locals.supabase, url.origin, destination));
	},
	signInWithPassword: async ({ locals, request }) => {
		const formData = await request.formData();
		const credentials = readEmailAndPassword(formData);
		const { emailAddress } = credentials;
		const inputProblem = problemWithCredentials(credentials);
		if (inputProblem !== null) return problemResponse(inputProblem, emailAddress);
		const signInProblem = await signInWithPassword(locals.supabase, credentials);
		if (signInProblem !== null) return problemResponse(signInProblem, emailAddress);
		redirect(303, await destinationAfterSignIn(locals, readDestination(formData)));
	},
	createAccount: async ({ request, url, getClientAddress }) => {
		const formData = await request.formData();
		const credentials = readEmailAndPassword(formData);
		const { emailAddress } = credentials;
		const inputProblem = problemWithCredentials(credentials);
		if (inputProblem !== null) return problemResponse(inputProblem, emailAddress);
		const isAllowed = emailSendAllowance.isAllowedFrom(getClientAddress());
		if (!isAllowed) return problemResponse(tooManyEmailsMessage, emailAddress);
		const destination = readDestination(formData);
		const signUpProblem = await createAccountWithPassword({ credentials, origin: url.origin, destination });
		if (signUpProblem !== null) return problemResponse(signUpProblem, emailAddress);
		return noticeResponse(confirmationEmailSent, emailAddress);
	},
	sendPasswordReset: async ({ request, url, getClientAddress }) => {
		const { emailAddress } = readEmailAndPassword(await request.formData());
		const inputProblem = problemWithEmailAddress(emailAddress);
		if (inputProblem !== null) return problemResponse(inputProblem, emailAddress);
		const isAllowed = emailSendAllowance.isAllowedFrom(getClientAddress());
		if (!isAllowed) return problemResponse(tooManyEmailsMessage, emailAddress);
		await sendUserPasswordReset(emailAddress, url.origin);
		return noticeResponse(resetEmailSent, emailAddress);
	}
};
