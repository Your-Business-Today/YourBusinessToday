import { StripeEventOutcomes, type StripeEventOutcome } from '$lib/data/billing/stripeEventRules';
import type { StripeEventSettlement } from './stripeEventBook';

const nothingPosted = { organisationId: null, invoiceId: null, journalId: null };
const noMoney = 0;

/** Money Stripe reported that no invoice in the books can take: kept with why, for an administrator to deal with. */
export function unmatchedBecause(reason: string, amountPence: number): StripeEventSettlement {
	return settledWithout(StripeEventOutcomes.unmatched, reason, amountPence);
}

/** An event that needs nothing more from the books, kept with why. */
export function ignoredBecause(reason: string): StripeEventSettlement {
	return settledWithout(StripeEventOutcomes.ignored, reason, noMoney);
}

/** An event whose posting stopped on an error; Stripe sends it again, and the next delivery claims it afresh. */
export function failedSettlement(amountPence: number): StripeEventSettlement {
	return settledWithout(StripeEventOutcomes.failed, 'Posting stopped on an error; Stripe sends the event again and it is posted then.', amountPence);
}

function settledWithout(outcome: StripeEventOutcome, reason: string, amountPence: number): StripeEventSettlement {
	return { outcome, reason, amountPence, ...nothingPosted };
}
