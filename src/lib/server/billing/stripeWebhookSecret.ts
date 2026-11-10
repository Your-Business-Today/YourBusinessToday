import { env } from '$env/dynamic/private';

/**
 * The signing secret of the webhook endpoint added in Stripe, from the STRIPE_WEBHOOK_SECRET environment variable
 * (whsec_…). Null until it is set, so the webhook refuses every call rather than trusting an unsigned one.
 */
export function stripeWebhookSecret(): string | null {
	const secret = env.STRIPE_WEBHOOK_SECRET ?? '';
	if (secret.length === 0) return null;
	return secret;
}
