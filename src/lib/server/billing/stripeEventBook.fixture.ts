import { StripeEventOutcomes, StripeEventTypes } from '$lib/data/billing/stripeEventRules';
import type { StripeEventBook, StripeEventClaim, StripeEventSettlement } from './stripeEventBook';

/** A Stripe event as the stand-in keeps it: the claim, and what became of it. */
export type KeptStripeEvent = StripeEventClaim & StripeEventSettlement & { rowId: string };

/** The books' Stripe events as a stand-in that keeps every claim and settlement, as migration 0182's table would. */
export function stripeEventBookStandIn() {
	const kept: KeptStripeEvent[] = [];
	const postedOf = (paymentIntentId: string) =>
		kept.filter((event) => event.paymentIntentId === paymentIntentId && event.outcome === StripeEventOutcomes.posted);
	const book: StripeEventBook = {
		claim: async (claim) => claimOrNull(kept, claim),
		settle: async (rowId, settlement) => {
			const event = kept.find((candidate) => candidate.rowId === rowId) as KeptStripeEvent;
			Object.assign(event, settlement);
		},
		findPostedPayment: async (paymentIntentId) => {
			const payment = postedOf(paymentIntentId).find((event) => event.eventType !== StripeEventTypes.chargeRefunded);
			if (payment === undefined) return null;
			return {
				organisationId: payment.organisationId as string,
				invoiceId: payment.invoiceId as string,
				amountPence: payment.amountPence
			};
		},
		findRefundedPence: async (paymentIntentId) =>
			postedOf(paymentIntentId)
				.filter((event) => event.eventType === StripeEventTypes.chargeRefunded)
				.reduce((total, event) => total + event.amountPence, 0)
	};
	return { book, kept };
}

function claimOrNull(kept: KeptStripeEvent[], claim: StripeEventClaim): string | null {
	const held = kept.find((event) => event.eventId === claim.eventId);
	if (held?.outcome === StripeEventOutcomes.failed) {
		held.outcome = StripeEventOutcomes.received;
		return held.rowId;
	}
	if (held !== undefined) return null;
	const rowId = `row-${kept.length + 1}`;
	kept.push({
		...claim,
		rowId,
		outcome: StripeEventOutcomes.received,
		reason: '',
		organisationId: null,
		invoiceId: null,
		journalId: null
	});
	return rowId;
}
