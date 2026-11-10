import { describe, expect, it } from 'vitest';
import { readStripeNotice } from './stripeNotice';

const created = 1795168800;
const session = {
	id: 'cs_test_1',
	payment_status: 'paid',
	amount_total: 2500,
	currency: 'gbp',
	payment_intent: { id: 'pi_test_1' },
	metadata: { books_invoice_id: 'i', books_organisation_id: 'o' }
};

describe('what a Stripe event tells the books', () => {
	it('reads a paid Checkout page: the invoice its metadata names, the money, and the UK day', () => {
		expect(
			readStripeNotice({
				id: 'evt_1',
				type: 'checkout.session.completed',
				created,
				data: { object: session }
			})
		).toEqual({
			kind: 'payment',
			eventId: 'evt_1',
			eventType: 'checkout.session.completed',
			happenedOn: '2026-11-20',
			paymentIntentId: 'pi_test_1',
			sessionId: 'cs_test_1',
			invoiceId: 'i',
			organisationId: 'o',
			amountPence: 2500,
			currency: 'gbp',
			payerEmail: ''
		});
	});

	it('reads nothing from a page not yet paid, or from an event the books do not act on', () => {
		const unpaid = { ...session, payment_status: 'unpaid' };
		expect(
			readStripeNotice({
				id: 'evt_2',
				type: 'checkout.session.completed',
				created,
				data: { object: unpaid }
			})
		).toBeNull();
		expect(
			readStripeNotice({
				id: 'evt_3',
				type: 'customer.created',
				created,
				data: { object: {} }
			})
		).toBeNull();
	});

	it('reads a refunded charge as everything refunded on it so far', () => {
		const charge = {
			id: 'ch_1',
			payment_intent: 'pi_test_1',
			amount_refunded: 700,
			currency: 'gbp'
		};
		expect(
			readStripeNotice({
				id: 'evt_4',
				type: 'charge.refunded',
				created,
				data: { object: charge }
			})
		).toEqual(
			expect.objectContaining({
				kind: 'refund',
				paymentIntentId: 'pi_test_1',
				chargeId: 'ch_1',
				refundedToPence: 700
			})
		);
	});
});
