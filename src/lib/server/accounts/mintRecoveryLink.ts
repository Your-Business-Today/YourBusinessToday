import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export type RecoveryLink = { accountId: string; actionLink: string };

type GeneratedLink = { user: { id: string }; properties: { action_link: string } };

export const setPasswordPath = '/auth/callback?next=/account/set-password';

/** A one-time link that signs the account holder in and takes them to set a password. */
export async function mintRecoveryLink(email: string, origin: string): Promise<RecoveryLink> {
	const { auth } = supabaseServiceClient();
	const recovered = await auth.admin.generateLink({
		type: 'recovery',
		email,
		options: { redirectTo: `${origin}${setPasswordPath}` }
	});
	if (recovered.error !== null) throw recovered.error;
	return recoveryLinkFrom(recovered.data);
}

export function recoveryLinkFrom(generated: GeneratedLink): RecoveryLink {
	const { user, properties } = generated;
	return { accountId: user.id, actionLink: properties.action_link };
}
