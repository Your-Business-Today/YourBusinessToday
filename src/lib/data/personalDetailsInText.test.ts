import { describe, expect, it } from 'vitest';
import { containsEmailAddress, containsPersonalDetails, containsPhoneNumber } from './personalDetailsInText';

describe('personal details written into a sentence', () => {
	it('finds an email address anywhere in the text', () => {
		expect(containsEmailAddress('Quotes go to sales@example.co.uk for checking')).toBe(true);
		expect(containsEmailAddress('Quotes go to the sales mailbox')).toBe(false);
	});

	it('finds a phone number however it is spaced', () => {
		expect(containsPhoneNumber('Ring 01632 960 123 to book')).toBe(true);
		expect(containsPhoneNumber('Ring +44 (0)1632-960123')).toBe(true);
	});

	it('leaves dates, amounts and counts alone', () => {
		expect(containsPhoneNumber('Invoices are raised by 2026-11-10 at 30 days')).toBe(false);
		expect(containsPersonalDetails('A job has 3 stages and 12 steps')).toBe(false);
	});
});
