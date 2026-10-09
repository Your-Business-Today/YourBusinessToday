import { findAccountByEmail } from '$lib/server/accounts/findAccountByEmail';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';

const noSuchAccount = 'There is no account with that email address.';
const couldNotSavePassword = 'That password could not be saved — try again.';

/** A sentence for the admin when the password could not be set, or null once it is. */
export async function setUserPassword(
	targetEmail: string,
	password: string
): Promise<string | null> {
	const service = supabaseServiceClient();
	const account = await findAccountByEmail(service, targetEmail);
	if (account === null) return noSuchAccount;
	const { auth } = service;
	const { error } = await auth.admin.updateUserById(account.id, { password });
	if (error !== null) return couldNotSavePassword;
	return null;
}
