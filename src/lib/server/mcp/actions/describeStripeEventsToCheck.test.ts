import { describe, expect, it } from 'vitest';
import { describeStripeEventsToCheck, everyStripePaymentPosted } from './describeStripeEventsToCheck';
import type { StripeEventToCheck } from '$lib/data/billing/stripeEventToCheck';

const stray: StripeEventToCheck = {
	id: 'row-1', stripeEventId: 'evt_stray', eventType: 'checkout.session.completed', paymentIntentId: 'pi_1', receivedAt: '2026-11-20T10:00:00Z',
	amountPence: 5000, currency: 'gbp', payerEmail: 'accounts@jewel.example', outcome: 'unmatched', reason: 'Checkout cs_1 names no invoice.'
};

describe('the Stripe payments an administrator is asked to check', () => {
	it('says so when there are none', () => {
		expect(describeStripeEventsToCheck([])).toBe(everyStripePaymentPosted);
	});

	it('names each one with when, what, how much, why and who paid', () => {
		expect(describeStripeEventsToCheck([stray])).toBe(
			'1 Stripe event is waiting to be checked, newest first:\n' +
				'- 20 Nov, 10:00 UK time: Payment of £50.00 (evt_stray, paid by accounts@jewel.example), Matches no invoice. Checkout cs_1 names no invoice.'
		);
	});
});
