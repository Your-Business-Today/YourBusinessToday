/**
 * books_invoices.stripe_checkout_session_id (migration 0178) holds a Stripe Checkout session id: text that starts
 * cs_, at most 255 characters. Stated once here, for the server that writes it.
 */
export const checkoutSessionIdRules = { prefix: 'cs_', maximumLength: 255 } as const;

/** Why the value cannot be kept as an invoice's Stripe Checkout session, or null when it can. */
export function validateCheckoutSessionId(candidate: string): string | null {
	const { prefix, maximumLength } = checkoutSessionIdRules;
	const hasPrefix = candidate.startsWith(prefix) && candidate.length > prefix.length;
	if (!hasPrefix) return `The Stripe Checkout session id must start ${prefix}; Stripe answered ${candidate}.`;
	if (candidate.length > maximumLength) return `The Stripe Checkout session id must be at most ${maximumLength} characters.`;
	return null;
}
