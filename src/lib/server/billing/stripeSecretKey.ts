import { env } from '$env/dynamic/private';

/**
 * Stripe's secret key, from the STRIPE_SECRET_KEY environment variable: a test key (sk_test_) opens test payment
 * pages, a live key real ones. Null until it is set.
 */
export function stripeSecretKey(): string | null {
	const secretKey = env.STRIPE_SECRET_KEY ?? '';
	if (secretKey.length === 0) return null;
	return secretKey;
}

/** Whether the key is set, so the Billing section can offer a link to pay. */
export function isStripeCheckoutOpen(): boolean {
	return stripeSecretKey() !== null;
}
