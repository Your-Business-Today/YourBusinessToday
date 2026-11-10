import { describe, expect, it } from 'vitest';
import { validatePaymentIntentId, validateStripeEventId, validateStripeEventReason } from './stripeEventRules';

describe('the columns a Stripe event is kept in', () => {
	it('refuses ids that are not Stripe event or payment ids, and an overlong reason', () => {
		expect(validateStripeEventId('evt_1')).toBeNull();
		expect(validateStripeEventId('evt_')).toBe('The Stripe event id must start evt_; Stripe sent evt_.');
		expect(validatePaymentIntentId(null)).toBeNull();
		expect(validatePaymentIntentId('ch_1')).toBe('The Stripe payment intent id must start pi_; Stripe sent ch_1.');
		expect(validateStripeEventReason('x'.repeat(1001))).toBe('The reason kept with a Stripe event must be at most 1000 characters.');
	});
});
