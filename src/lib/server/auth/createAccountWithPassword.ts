import { confirmLinkFor } from './confirmLinkFor';
import type { EmailAndPassword } from './emailAndPassword';
import { sendUserPasswordReset } from '$lib/server/admin/sendUserPasswordReset';
import { confirmAccountEmailSubject, renderConfirmAccountEmail } from '$lib/server/email/confirmAccountEmail';
import { sendTransactionalEmail } from '$lib/server/email/sendTransactionalEmail';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { emailDeliveries } from '$lib/data/emailDelivery';

export type SignUpRequest = { credentials: EmailAndPassword; origin: string; destination: string | null };

const accountExistsCodes: readonly (string | undefined)[] = ['email_exists', 'user_already_exists'];
const couldNotCreateAccount = 'We could not create an account with those details.';
const couldNotSendConfirmation =
	'Your account is made but the confirmation email could not be sent — try again in a few minutes.';

/**
 * A sentence for the person when signing up failed, or null once the email is on its way.
 * The confirmation goes out through the site's own mail, as invitations do, rather than
 * Supabase's mailer. An address that already holds an account is sent a set-password link
 * instead, and the page says the same either way, so it never tells who has an account.
 */
export async function createAccountWithPassword(signUp: SignUpRequest): Promise<string | null> {
	const { credentials, origin, destination } = signUp;
	const { emailAddress, password } = credentials;
	const { auth } = supabaseServiceClient();
	const { data, error } = await auth.admin.generateLink({ type: 'signup', email: emailAddress, password });
	const errorCode = error?.code;
	if (accountExistsCodes.includes(errorCode)) {
		await sendUserPasswordReset(emailAddress, origin);
		return null;
	}
	if (error !== null) return couldNotCreateAccount;
	const confirmUrl = confirmLinkFor(origin, data.properties, destination);
	const delivery = await sendTransactionalEmail({
		to: emailAddress,
		subject: confirmAccountEmailSubject,
		html: renderConfirmAccountEmail(confirmUrl)
	});
	if (delivery !== emailDeliveries.sent) return couldNotSendConfirmation;
	return null;
}
