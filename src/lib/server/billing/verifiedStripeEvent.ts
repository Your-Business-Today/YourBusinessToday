import Stripe from 'stripe';
import type { StripeEventDelivery } from '$lib/data/billing/stripeNotice';

/**
 * The event Stripe sent, when the Stripe-Signature header proves Stripe signed this very body with the endpoint's
 * secret within the last five minutes; null for anything else, so no caller but Stripe can post to the books.
 */
export function verifiedStripeEvent(body: string, signature: string | null, secret: string): StripeEventDelivery | null {
	if (signature === null) return null;
	try {
		return Stripe.webhooks.constructEvent(body, signature, secret) as StripeEventDelivery;
	} catch {
		return null;
	}
}
