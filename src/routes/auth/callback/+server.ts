import { redirect } from '@sveltejs/kit';
import { destinationAfterSignIn } from '$lib/server/auth/localDestination';
import type { RequestHandler } from './$types';

const signInPath = '/account/sign-in';

export const GET: RequestHandler = async ({ url, locals }) => {
	const code = url.searchParams.get('code');
	if (code === null) redirect(303, signInPath);
	const { auth } = locals.supabase;
	const { error } = await auth.exchangeCodeForSession(code);
	if (error) redirect(303, signInPath);
	redirect(303, await destinationAfterSignIn(locals, url.searchParams.get('next')));
};
