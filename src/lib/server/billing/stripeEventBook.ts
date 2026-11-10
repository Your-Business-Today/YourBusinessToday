import type { StripeEventOutcome, StripeEventType } from '$lib/data/billing/stripeEventRules';

/** An event as it is first kept, before anything is posted for it. */
export type StripeEventClaim = {
	eventId: string;
	eventType: StripeEventType;
	paymentIntentId: string | null;
	amountPence: number;
	currency: string;
	payerEmail: string;
};

/** What became of the event: the outcome and why, and the invoice, money and journal it posted. */
export type StripeEventSettlement = {
	outcome: StripeEventOutcome;
	reason: string;
	organisationId: string | null;
	invoiceId: string | null;
	amountPence: number;
	journalId: string | null;
};

/** A payment the books have posted from Stripe: the invoice it paid, and how much. */
export type PostedStripePayment = { organisationId: string; invoiceId: string; amountPence: number };

/**
 * The Stripe events the books keep (migration 0182). A claim keeps the event and answers its row, or null when the
 * event is already held, so an event Stripe sends twice is acted on once; one that failed before is claimed again.
 */
export type StripeEventBook = {
	claim: (claim: StripeEventClaim) => Promise<string | null>;
	settle: (rowId: string, settlement: StripeEventSettlement) => Promise<void>;
	findPostedPayment: (paymentIntentId: string) => Promise<PostedStripePayment | null>;
	findRefundedPence: (paymentIntentId: string) => Promise<number>;
};
