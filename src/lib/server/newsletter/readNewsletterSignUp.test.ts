import { describe, expect, it } from 'vitest';
import { readNewsletterSignUp } from './readNewsletterSignUp';
import { newsletterEmailLimit, newsletterHoneypotField } from '$lib/data/newsletterSignUp';

function signUpForm(fields: Record<string, string>): FormData {
	const formData = new FormData();
	for (const [fieldName, value] of Object.entries(fields)) formData.set(fieldName, value);
	return formData;
}

describe('readNewsletterSignUp', () => {
	it('takes the address in lower case without its spaces', () => {
		const reading = readNewsletterSignUp(signUpForm({ email: '  Jeremy@Example.co.uk ' }));
		expect(reading).toEqual({ email: 'jeremy@example.co.uk' });
	});

	it('refuses text that is not an email address', () => {
		const reading = readNewsletterSignUp(signUpForm({ email: 'jeremy' }));
		expect(reading).toEqual({
			problem: 'Enter an email address for YBT Weekly to go to.'
		});
	});

	it('refuses an address longer than its column', () => {
		const localPart = 'a'.repeat(newsletterEmailLimit);
		const reading = readNewsletterSignUp(signUpForm({ email: `${localPart}@example.com` }));
		expect(reading).toHaveProperty('problem');
	});

	it('sets a filled honeypot aside without keeping the address', () => {
		const fields = { email: 'bot@example.com', [newsletterHoneypotField]: 'x' };
		expect(readNewsletterSignUp(signUpForm(fields))).toEqual({
			isHoneypotFilled: true
		});
	});
});
