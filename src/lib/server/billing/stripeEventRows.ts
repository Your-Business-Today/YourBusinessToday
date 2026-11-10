import {
	StripeEventOutcomes,
	stripeEventColumnRules,
	validatePaymentIntentId,
	validateStripeEventId,
	validateStripeEventReason
} from '$lib/data/billing/stripeEventRules';
import type { StripeEventClaim, StripeEventSettlement } from './stripeEventBook';

export const stripeEventsTable = 'books_stripe_events';

const noMoney = 0;

/** The row a claim keeps, once every value is checked against its column; a value that does not fit is refused. */
export function toClaimRow(claim: StripeEventClaim) {
	refuseWhenSet(validateStripeEventId(claim.eventId));
	refuseWhenSet(validatePaymentIntentId(claim.paymentIntentId));
	refuseWhenSet(moneyAndPayerRefusal(claim));
	return {
		stripe_event_id: claim.eventId,
		event_type: claim.eventType,
		stripe_payment_intent_id: claim.paymentIntentId,
		amount_pence: claim.amountPence,
		currency: claim.currency,
		payer_email: claim.payerEmail,
		outcome: StripeEventOutcomes.received
	};
}

/** The columns a settlement changes, stamped with the moment it settled. */
export function toSettlementRow(settlement: StripeEventSettlement) {
	refuseWhenSet(validateStripeEventReason(settlement.reason));
	return {
		outcome: settlement.outcome,
		reason: settlement.reason,
		organisation_id: settlement.organisationId,
		invoice_id: settlement.invoiceId,
		amount_pence: settlement.amountPence,
		journal_id: settlement.journalId,
		settled_at: new Date().toISOString()
	};
}

function moneyAndPayerRefusal(claim: StripeEventClaim): string | null {
	const { currencyLength, maximumEmailLength } = stripeEventColumnRules;
	const { amountPence, currency, payerEmail } = claim;
	const isWholePence = Number.isSafeInteger(amountPence) && amountPence >= noMoney;
	if (!isWholePence) return `The amount of a Stripe event is whole pence, not below nothing; Stripe sent ${amountPence}.`;
	if (currency.length > currencyLength) return `The currency of a Stripe event is a ${currencyLength}-letter code; Stripe sent ${currency}.`;
	if (payerEmail.length > maximumEmailLength) return `The payer's email kept with a Stripe event is at most ${maximumEmailLength} characters.`;
	return null;
}

function refuseWhenSet(refusal: string | null): void {
	if (refusal !== null) throw new Error(refusal);
}
