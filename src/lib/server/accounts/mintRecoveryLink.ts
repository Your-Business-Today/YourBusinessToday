import { confirmLinkFor, type EmailToken } from '$lib/server/auth/confirmLinkFor';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

export type RecoveryLink = { accountId: string; actionLink: string };

type GeneratedLink = { user: { id: string }; properties: EmailToken };

export const setPasswordPath = '/account/set-password';

/** A one-time link that signs the account holder in and takes them to set a password, or to the destination named. */
export async function mintRecoveryLink(
	email: string,
	origin: string,
	destination: string = setPasswordPath
): Promise<RecoveryLink> {
	const { auth } = supabaseServiceClient();
	const recovered = await auth.admin.generateLink({ type: 'recovery', email });
	if (recovered.error !== null) throw recovered.error;
	return recoveryLinkFrom(recovered.data, origin, destination);
}

export function recoveryLinkFrom(
	generated: GeneratedLink,
	origin: string,
	destination: string = setPasswordPath
): RecoveryLink {
	const { user, properties } = generated;
	return { accountId: user.id, actionLink: confirmLinkFor(origin, properties, destination) };
}
