import { mintRecoveryLink, recoveryLinkFrom, setPasswordPath, type RecoveryLink } from './mintRecoveryLink';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export type SignInLink = RecoveryLink;

/**
 * An address we have never seen gets an invite link, which creates the
 * account; one that already holds an account cannot be invited twice, so it
 * gets a recovery link to the same set-password page.
 */
export async function mintSignInLink(email: string, origin: string): Promise<SignInLink> {
	const { auth } = supabaseServiceClient();
	const invited = await auth.admin.generateLink({
		type: 'invite',
		email,
		options: { redirectTo: `${origin}${setPasswordPath}` }
	});
	if (invited.error !== null) return mintRecoveryLink(email, origin);
	return recoveryLinkFrom(invited.data);
}
