import type { SupabaseClient } from '@supabase/supabase-js';
import { StripeEventOutcomes, StripeEventTypes } from '$lib/data/billing/stripeEventRules';
import { claimStripeEvent } from './claimStripeEvent';
import { stripeEventsTable, toSettlementRow } from './stripeEventRows';
import type { PostedStripePayment, StripeEventBook } from './stripeEventBook';

type PostedPaymentRow = { organisation_id: string; invoice_id: string; amount_pence: number | string };
type RefundRow = { amount_pence: number | string };

const paymentEventTypes = [StripeEventTypes.checkoutCompleted, StripeEventTypes.checkoutPaidLater];

/** The Stripe events kept in the books, read and written with the service key by the webhook alone. */
export function booksStripeEvents(service: SupabaseClient): StripeEventBook {
	return {
		claim: (claim) => claimStripeEvent(service, claim),
		settle: async (rowId, settlement) => {
			const { error } = await service.from(stripeEventsTable).update(toSettlementRow(settlement)).eq('id', rowId);
			if (error !== null) throw error;
		},
		findPostedPayment: (paymentIntentId) => findPostedPayment(service, paymentIntentId),
		findRefundedPence: (paymentIntentId) => findRefundedPence(service, paymentIntentId)
	};
}

async function findPostedPayment(service: SupabaseClient, paymentIntentId: string): Promise<PostedStripePayment | null> {
	const { data, error } = await service
		.from(stripeEventsTable)
		.select('organisation_id, invoice_id, amount_pence')
		.eq('stripe_payment_intent_id', paymentIntentId)
		.eq('outcome', StripeEventOutcomes.posted)
		.in('event_type', paymentEventTypes)
		.not('invoice_id', 'is', null)
		.limit(1)
		.maybeSingle();
	if (error !== null) throw error;
	const row = data as PostedPaymentRow | null;
	if (row === null) return null;
	return { organisationId: row.organisation_id, invoiceId: row.invoice_id, amountPence: Number(row.amount_pence) };
}

async function findRefundedPence(service: SupabaseClient, paymentIntentId: string): Promise<number> {
	const { data, error } = await service
		.from(stripeEventsTable)
		.select('amount_pence')
		.eq('stripe_payment_intent_id', paymentIntentId)
		.eq('outcome', StripeEventOutcomes.posted)
		.eq('event_type', StripeEventTypes.chargeRefunded);
	if (error !== null) throw error;
	return (data as RefundRow[]).reduce((total, row) => total + Number(row.amount_pence), 0);
}
