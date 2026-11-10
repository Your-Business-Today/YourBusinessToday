import Stripe from 'stripe';
import { describe, expect, it } from 'vitest';
import { verifiedStripeEvent } from './verifiedStripeEvent';

const endpointSecret = 'whsec_test_stand_in';
const body = JSON.stringify({
	id: 'evt_test_signed',
	object: 'event',
	type: 'charge.refunded',
	created: 1795168800,
	data: { object: {} }
});
const signedBy = (secret: string, payload = body) => Stripe.webhooks.generateTestHeaderString({ payload, secret });

describe("Stripe's signature on a webhook call", () => {
	it('lets in the event Stripe signed with the endpoint secret', () => {
		expect(verifiedStripeEvent(body, signedBy(endpointSecret), endpointSecret)).toEqual(
			expect.objectContaining({
				id: 'evt_test_signed',
				type: 'charge.refunded'
			})
		);
	});

	it('refuses a call with no signature, signed with another secret, or whose body was changed after signing', () => {
		expect(verifiedStripeEvent(body, null, endpointSecret)).toBeNull();
		expect(verifiedStripeEvent(body, signedBy('whsec_someone_else'), endpointSecret)).toBeNull();
		expect(
			verifiedStripeEvent(body.replace('charge.refunded', 'checkout.session.completed'), signedBy(endpointSecret), endpointSecret)
		).toBeNull();
	});
});
