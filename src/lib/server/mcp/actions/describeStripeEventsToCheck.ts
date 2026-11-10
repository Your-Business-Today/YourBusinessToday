import { formatUkDateTime } from '$lib/data/britishDate';
import { stripeEventAmountOf, stripeEventKindOf, stripeOutcomeLabels, type StripeEventToCheck } from '$lib/data/billing/stripeEventToCheck';

export const everyStripePaymentPosted = 'Every Stripe payment and refund the webhook received is posted to the books; none is waiting to be checked.';

/** Each Stripe event to check on its own line: when, what, how much, where it stands, why, and who paid. */
export function describeStripeEventsToCheck(events: StripeEventToCheck[]): string {
	if (events.length === 0) return everyStripePaymentPosted;
	const heading = `${events.length} Stripe ${events.length === 1 ? 'event is' : 'events are'} waiting to be checked, newest first:`;
	return [heading, ...events.map(describeEvent)].join('\n');
}

function describeEvent(event: StripeEventToCheck): string {
	const received = formatUkDateTime(event.receivedAt);
	const payer = event.payerEmail === '' ? '' : `, paid by ${event.payerEmail}`;
	const standing = stripeOutcomeLabels[event.outcome];
	return `- ${received} UK time: ${stripeEventKindOf(event)} of ${stripeEventAmountOf(event)} (${event.stripeEventId}${payer}), ${standing}. ${event.reason}`;
}
