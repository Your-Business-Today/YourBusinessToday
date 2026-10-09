import type { SupabaseClient } from '@supabase/supabase-js';
import { callbackUrlFor } from './callbackUrlFor';

const setPasswordPath = '/account/set-password';

/**
 * The result is deliberately unread: reporting whether the email was sent would
 * tell a stranger which addresses have an account here.
 */
export async function sendPasswordResetEmail(
	supabase: SupabaseClient,
	emailAddress: string,
	origin: string
): Promise<void> {
	await supabase.auth.resetPasswordForEmail(emailAddress, {
		redirectTo: callbackUrlFor(origin, setPasswordPath)
	});
}
