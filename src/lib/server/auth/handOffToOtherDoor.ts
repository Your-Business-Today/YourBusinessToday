import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export const handOffPath = '/auth/hand-off';

/**
 * Sessions live on one host, so an account signed in at the wrong door is
 * signed out there and carried to the other by a one-time sign-in link.
 */
export async function handOffToOtherDoor(
	locals: App.Locals,
	emailAddress: string,
	destination: string | null
): Promise<string> {
	const tokenHash = await mintSignInTokenHash(emailAddress);
	const { auth } = locals.supabase;
	await auth.signOut({ scope: 'local' });
	const { door } = locals;
	const handOffUrl = new URL(handOffPath, door.otherDoorOrigin);
	handOffUrl.searchParams.set('token_hash', tokenHash);
	if (destination !== null) handOffUrl.searchParams.set('next', destination);
	return handOffUrl.toString();
}

async function mintSignInTokenHash(emailAddress: string): Promise<string> {
	const { auth } = supabaseServiceClient();
	const { data, error } = await auth.admin.generateLink({ type: 'magiclink', email: emailAddress });
	if (error) throw error;
	const { properties } = data;
	return properties.hashed_token;
}
