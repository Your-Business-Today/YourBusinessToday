import { redirect } from '@sveltejs/kit';
import { destinationAfterSignIn } from '$lib/server/auth/localDestination';
import type { EmailOtpType } from '@supabase/supabase-js';
import type { RequestHandler } from './$types';

const signInPath = '/account/sign-in';
const emailLinkTypes: readonly string[] = ['signup', 'invite', 'magiclink', 'recovery', 'email'];

function readLinkType(linkType: string | null): EmailOtpType | null {
	if (linkType === null || !emailLinkTypes.includes(linkType)) return null;
	return linkType as EmailOtpType;
}

export const GET: RequestHandler = async ({ url, locals }) => {
	const tokenHash = url.searchParams.get('token_hash');
	const linkType = readLinkType(url.searchParams.get('type'));
	if (tokenHash === null || linkType === null) redirect(303, signInPath);
	const { auth } = locals.supabase;
	const { error } = await auth.verifyOtp({ token_hash: tokenHash, type: linkType });
	if (error) redirect(303, signInPath);
	redirect(303, await destinationAfterSignIn(locals, url.searchParams.get('next')));
};
