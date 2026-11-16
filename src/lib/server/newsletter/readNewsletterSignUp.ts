import { isEmailShaped } from '$lib/data/emailShape';
import { newsletterEmailLimit, newsletterHoneypotField } from '$lib/data/newsletterSignUp';

export type NewsletterSignUpReading =
	| { email: string }
	| { isHoneypotFilled: true }
	| { problem: string };

const overlongProblem = `Keep the email address under ${newsletterEmailLimit} characters.`;
const notAnEmailProblem = 'Enter an email address for YBT Weekly to go to.';

/** The email address a sign-up form carries, or why it cannot be taken. */
export function readNewsletterSignUp(formData: FormData): NewsletterSignUpReading {
	const honeypot = fieldValue(formData, newsletterHoneypotField);
	if (honeypot !== '') return { isHoneypotFilled: true };
	const email = fieldValue(formData, 'email').toLowerCase();
	if (email.length > newsletterEmailLimit) return { problem: overlongProblem };
	if (!isEmailShaped(email)) return { problem: notAnEmailProblem };
	return { email };
}

function fieldValue(formData: FormData, fieldName: string): string {
	return String(formData.get(fieldName) ?? '').trim();
}
