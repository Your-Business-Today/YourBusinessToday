import type { StripeEventDelivery } from '$lib/data/billing/stripeNotice';

/** 20 Nov 2026, 10:00 UTC, as Stripe stamps an event: seconds since 1970. */
export const twentiethOfNovember = 1795168800;

/** Stripe telling the webhook a Checkout page for the invoice was paid, as a test-mode event would. */
export function paidCheckout(eventId: string, invoice: { invoiceId: string; organisationId: string } | null, amountPence: number): StripeEventDelivery {
	const metadata = invoice === null ? {} : { books_invoice_id: invoice.invoiceId, books_organisation_id: invoice.organisationId, invoice_number: 'INV-6' };
	const session = {
		id: 'cs_test_paid',
		payment_status: 'paid',
		amount_total: amountPence,
		currency: 'gbp',
		payment_intent: 'pi_test_paid',
		metadata,
		customer_details: { email: 'accounts@jewel.example' }
	};
	return { id: eventId, type: 'checkout.session.completed', created: twentiethOfNovember, data: { object: session } };
}

/** Stripe telling the webhook a charge has been refunded, with all refunded on it so far. */
export function refundedCharge(eventId: string, paymentIntentId: string, refundedToPence: number): StripeEventDelivery {
	const charge = { id: 'ch_test_paid', payment_intent: paymentIntentId, amount_refunded: refundedToPence, currency: 'gbp' };
	return { id: eventId, type: 'charge.refunded', created: twentiethOfNovember, data: { object: charge } };
}
