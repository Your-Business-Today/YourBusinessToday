import { checkoutMetadataKeys } from './checkoutMetadata';

/** A paid Checkout page as the books read it: the invoice its metadata names, the money, and who paid. */
export type CheckoutPayment = {
	paymentIntentId: string | null;
	sessionId: string;
	invoiceId: string | null;
	organisationId: string | null;
	amountPence: number;
	currency: string;
	payerEmail: string;
};

/** The parts of Stripe's Checkout session the books read; anything else on it is left alone. */
type CheckoutSessionShape = {
	id?: string;
	payment_status?: string;
	amount_total?: number | null;
	currency?: string | null;
	payment_intent?: string | { id?: string } | null;
	metadata?: Record<string, string> | null;
	customer_details?: { email?: string | null } | null;
};

const paid = 'paid';

/** The payment the session reports, or null while it is not paid: a page paid later reports again when it is. */
export function readCheckoutPayment(session: unknown): CheckoutPayment | null {
	const shape = (session ?? {}) as CheckoutSessionShape;
	if (shape.payment_status !== paid) return null;
	const metadata = shape.metadata ?? {};
	const customer = shape.customer_details ?? {};
	return {
		paymentIntentId: idOf(shape.payment_intent),
		sessionId: shape.id ?? '',
		invoiceId: metadata[checkoutMetadataKeys.invoiceId] ?? null,
		organisationId: metadata[checkoutMetadataKeys.organisationId] ?? null,
		amountPence: shape.amount_total ?? 0,
		currency: shape.currency ?? '',
		payerEmail: customer.email ?? ''
	};
}

/** Stripe sends a linked object as its id, or the object itself when it was expanded. */
export function idOf(linked: string | { id?: string } | null | undefined): string | null {
	if (typeof linked === 'string') return linked;
	return linked?.id ?? null;
}
