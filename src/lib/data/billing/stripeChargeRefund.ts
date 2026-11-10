import { idOf } from './stripeCheckoutPayment';

/** A refunded charge as the books read it: its payment, and all refunded on it so far, in pence. */
export type ChargeRefund = { paymentIntentId: string | null; chargeId: string; refundedToPence: number; currency: string };

/** The parts of Stripe's charge the books read; anything else on it is left alone. */
type ChargeShape = {
	id?: string;
	payment_intent?: string | { id?: string } | null;
	amount_refunded?: number;
	currency?: string | null;
};

/**
 * Stripe reports every refund on a charge with the total refunded on it so far, so a second partial refund carries
 * both; the books post only what is beyond the refunds they already hold.
 */
export function readChargeRefund(charge: unknown): ChargeRefund {
	const shape = (charge ?? {}) as ChargeShape;
	return {
		paymentIntentId: idOf(shape.payment_intent),
		chargeId: shape.id ?? '',
		refundedToPence: shape.amount_refunded ?? 0,
		currency: shape.currency ?? ''
	};
}
