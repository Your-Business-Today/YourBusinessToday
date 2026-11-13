import { env } from '$env/dynamic/private';
import {
	renderWorkflowMapConfirmedEmail,
	workflowMapConfirmedSubject,
	type ConfirmedWorkflowMap
} from '$lib/server/email/workflowMapConfirmedEmail';
import { sendTransactionalEmail, type EmailDelivery } from '$lib/server/email/sendTransactionalEmail';

/** Emails the staff inbox, the one website enquiries reach, that a client has confirmed their workflow map. */
export async function notifyWorkflowMapConfirmed(confirmed: ConfirmedWorkflowMap): Promise<EmailDelivery> {
	if (!env.ENQUIRY_NOTIFICATION_EMAIL) return 'skipped';
	return sendTransactionalEmail({
		to: env.ENQUIRY_NOTIFICATION_EMAIL,
		subject: workflowMapConfirmedSubject(confirmed),
		html: renderWorkflowMapConfirmedEmail(confirmed)
	});
}
