/** The Stripe events the books act on: a Checkout payment made at once or later, and a charge refunded. */
export const StripeEventTypes = {
	checkoutCompleted: 'checkout.session.completed',
	checkoutPaidLater: 'checkout.session.async_payment_succeeded',
	chargeRefunded: 'charge.refunded'
} as const;

export type StripeEventType = (typeof StripeEventTypes)[keyof typeof StripeEventTypes];

/**
 * What became of an event the books kept (migration 0182): being posted, posted, matching no invoice the books can
 * post it to, needing nothing more, or stopped on an error Stripe will send it again for.
 */
export const StripeEventOutcomes = {
	received: 'received',
	posted: 'posted',
	unmatched: 'unmatched',
	ignored: 'ignored',
	failed: 'failed'
} as const;

export type StripeEventOutcome = (typeof StripeEventOutcomes)[keyof typeof StripeEventOutcomes];

/** books_stripe_events' limits, stated once here for the server that writes it. */
export const stripeEventColumnRules = {
	eventIdPrefix: 'evt_',
	paymentIntentPrefix: 'pi_',
	maximumIdLength: 255,
	maximumReasonLength: 1000,
	maximumEmailLength: 320,
	currencyLength: 3
} as const;

/** The only currency the books take payments in. */
export const poundSterling = 'gbp';

/** Why the value cannot be kept as the event's id, or null when it can. */
export function validateStripeEventId(candidate: string): string | null {
	return prefixedIdRefusal('Stripe event id', stripeEventColumnRules.eventIdPrefix, candidate);
}

/** Why the value cannot be kept as the payment's id, or null when it can or there is none. */
export function validatePaymentIntentId(candidate: string | null): string | null {
	if (candidate === null) return null;
	return prefixedIdRefusal('Stripe payment intent id', stripeEventColumnRules.paymentIntentPrefix, candidate);
}

/** Why the reason cannot be kept beside the event, or null when it can. */
export function validateStripeEventReason(reason: string): string | null {
	const { maximumReasonLength } = stripeEventColumnRules;
	if (reason.length <= maximumReasonLength) return null;
	return `The reason kept with a Stripe event must be at most ${maximumReasonLength} characters.`;
}

function prefixedIdRefusal(fieldName: string, prefix: string, candidate: string): string | null {
	const { maximumIdLength } = stripeEventColumnRules;
	const hasPrefix = candidate.startsWith(prefix) && candidate.length > prefix.length;
	if (!hasPrefix) return `The ${fieldName} must start ${prefix}; Stripe sent ${candidate}.`;
	if (candidate.length > maximumIdLength) return `The ${fieldName} must be at most ${maximumIdLength} characters.`;
	return null;
}
