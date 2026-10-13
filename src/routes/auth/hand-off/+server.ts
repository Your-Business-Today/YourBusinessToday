import { redirect } from '@sveltejs/kit';
import { destinationAfterSignIn } from '$lib/server/auth/localDestination';
import type { RequestHandler } from './$types';

const signInPath = '/account/sign-in';
const signInLinkType = 'magiclink';

export const GET: RequestHandler = async ({ url, locals }) => {
	const tokenHash = url.searchParams.get('token_hash');
	if (tokenHash === null) redirect(303, signInPath);
	const { auth } = locals.supabase;
	const { error } = await auth.verifyOtp({ token_hash: tokenHash, type: signInLinkType });
	if (error) redirect(303, signInPath);
	redirect(303, await destinationAfterSignIn(locals, url.searchParams.get('next')));
};
