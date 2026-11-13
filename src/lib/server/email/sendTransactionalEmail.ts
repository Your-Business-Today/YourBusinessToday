import { env } from '$env/dynamic/private';
import type { EmailDelivery } from '$lib/data/emailDelivery';

const resendEndpoint = 'https://api.resend.com/emails';

export type { EmailDelivery };

/** A file sent with the email: its name, and its bytes in base64 as Resend takes them. */
export type EmailAttachment = { filename: string; content: string };

export type TransactionalEmail = {
	to: string;
	subject: string;
	html: string;
	attachments?: EmailAttachment[];
	replyTo?: string;
	bcc?: string;
};

export async function sendTransactionalEmail(email: TransactionalEmail): Promise<EmailDelivery> {
	if (!env.RESEND_API_KEY || !env.EMAIL_FROM) return 'skipped';
	try {
		return await deliverThroughResend(email);
	} catch (failure) {
		console.error('Email send failed', { to: email.to, subject: email.subject, failure });
		return 'failed';
	}
}

async function deliverThroughResend(email: TransactionalEmail): Promise<EmailDelivery> {
	const response = await fetch(resendEndpoint, {
		method: 'POST',
		headers: {
			'content-type': 'application/json',
			authorization: `Bearer ${env.RESEND_API_KEY}`
		},
		body: JSON.stringify({
			from: env.EMAIL_FROM,
			to: [email.to],
			subject: email.subject,
			html: email.html,
			attachments: email.attachments,
			reply_to: email.replyTo,
			bcc: email.bcc
		})
	});
	if (!response.ok) throw new Error(`Resend answered ${response.status}`);
	return 'sent';
}
