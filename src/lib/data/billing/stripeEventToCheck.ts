import { formatPoundsAndPence, fromPence } from '$lib/data/books/money';
import { StripeEventTypes, poundSterling, type StripeEventOutcome } from './stripeEventRules';

/** A Stripe event the books could not finish with by themselves, as an administrator reads it to deal with it. */
export type StripeEventToCheck = {
	id: string;
	stripeEventId: string;
	eventType: string;
	paymentIntentId: string | null;
	receivedAt: string;
	amountPence: number;
	currency: string;
	payerEmail: string;
	outcome: StripeEventOutcome;
	reason: string;
};

/** How long an event may stand received before it counts as never finished. */
export const minutesBeforeUnfinished = 10;

export const stripeOutcomeLabels: Record<StripeEventOutcome, string> = {
	received: 'Never finished',
	posted: 'Posted',
	unmatched: 'Matches no invoice',
	ignored: 'Nothing to post',
	failed: 'Stopped on an error'
};

const eventKindLabels: Record<string, string> = { [StripeEventTypes.chargeRefunded]: 'Refund' };

/** Whether the event reported money paid or money refunded. */
export function stripeEventKindOf(event: StripeEventToCheck): string {
	return eventKindLabels[event.eventType] ?? 'Payment';
}

/** The money the event reported, in pounds when it was in pounds, else in the currency's smallest unit as Stripe sent it. */
export function stripeEventAmountOf(event: StripeEventToCheck): string {
	const { currency, amountPence } = event;
	const pounds = fromPence(amountPence);
	if (currency === poundSterling) return formatPoundsAndPence(pounds);
	return `${amountPence} ${currency.toUpperCase()} (smallest unit)`;
}
