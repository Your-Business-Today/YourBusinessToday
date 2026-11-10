import { error, json } from '@sveltejs/kit';
import { readStripeNotice } from '$lib/data/billing/stripeNotice';
import { booksStripeEvents } from '$lib/server/billing/booksStripeEvents';
import { receiveStripeNotice } from '$lib/server/billing/receiveStripeNotice';
import { stripeBooksPoster } from '$lib/server/billing/stripeBooksPoster';
import { stripeWebhookSecret } from '$lib/server/billing/stripeWebhookSecret';
import { verifiedStripeEvent } from '$lib/server/billing/verifiedStripeEvent';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import type { RequestHandler } from './$types';

/**
 * Stripe calls this when a client pays an invoice from the Billing section (checkout.session.completed, or
 * checkout.session.async_payment_succeeded for a payment that clears later) and when a payment is refunded
 * (charge.refunded). Only a call Stripe signed is let in. An error answers 500, so Stripe sends the event again.
 */
export const POST: RequestHandler = async ({ request }) => {
	const secret = stripeWebhookSecret();
	if (secret === null) error(503, 'stripe_webhook_not_configured');
	const body = await request.text();
	const event = verifiedStripeEvent(body, request.headers.get('stripe-signature'), secret);
	if (event === null) error(400, 'invalid_signature');
	const notice = readStripeNotice(event);
	if (notice === null) return json({ outcome: 'not_for_the_books' });
	const service = supabaseServiceClient();
	return json(await receiveStripeNotice(booksStripeEvents(service), stripeBooksPoster(service), notice));
};
