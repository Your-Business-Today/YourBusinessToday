import { env } from '$env/dynamic/private';
import {
	contextConfirmedSubject,
	renderContextConfirmedEmail,
	type ConfirmedContext
} from '$lib/server/email/contextConfirmedEmail';
import { sendTransactionalEmail, type EmailDelivery } from '$lib/server/email/sendTransactionalEmail';

/** Emails the staff inbox, the one website enquiries reach, that a client has confirmed their company context. */
export async function notifyContextConfirmed(confirmed: ConfirmedContext): Promise<EmailDelivery> {
	if (!env.ENQUIRY_NOTIFICATION_EMAIL) return 'skipped';
	return sendTransactionalEmail({
		to: env.ENQUIRY_NOTIFICATION_EMAIL,
		subject: contextConfirmedSubject(confirmed),
		html: renderContextConfirmedEmail(confirmed)
	});
}
