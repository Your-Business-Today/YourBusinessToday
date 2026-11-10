import {
	mintRecoveryLink,
	recoveryLinkFrom,
	setPasswordPath,
	type RecoveryLink
} from './mintRecoveryLink';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export type SignInLink = RecoveryLink;

/**
 * An address we have never seen gets an invite link, which creates the
 * account; one that already holds an account cannot be invited twice, so it
 * gets a recovery link to the same set-password page. Either link lands on the
 * destination given, the set-password page unless another is named.
 */
export async function mintSignInLink(
	email: string,
	origin: string,
	destination: string = setPasswordPath
): Promise<SignInLink> {
	const { auth } = supabaseServiceClient();
	const invited = await auth.admin.generateLink({ type: 'invite', email });
	if (invited.error !== null) return mintRecoveryLink(email, origin, destination);
	return recoveryLinkFrom(invited.data, origin, destination);
}
