import type { StripeEventOutcome } from '$lib/data/billing/stripeEventRules';
import { StripeNoticeKinds, type StripeNotice } from '$lib/data/billing/stripeNotice';
import { settleStripePayment } from './settleStripePayment';
import { settleStripeRefund } from './settleStripeRefund';
import type { StripeBooksPoster } from './stripeBooksPoster';
import type { StripeEventBook, StripeEventClaim, StripeEventSettlement } from './stripeEventBook';
import { failedSettlement } from './stripeSettlements';

/** What the webhook answers Stripe: what became of the event, or that it was already held. */
export type StripeReceipt = {
	outcome: StripeEventOutcome | 'already_received';
};

/**
 * Keeps the event before anything is posted, so Stripe sending it twice posts once, then posts it and keeps what
 * became of it. An error while posting keeps the event as failed and is thrown on, so Stripe sends it again and it is
 * posted then. An error keeping what became of it leaves the event received, never failed, so a payment already posted
 * is never posted again; it stays listed for an administrator to check.
 */
export async function receiveStripeNotice(book: StripeEventBook, poster: StripeBooksPoster, notice: StripeNotice): Promise<StripeReceipt> {
	const claim = claimOf(notice);
	const rowId = await book.claim(claim);
	if (rowId === null) return { outcome: 'already_received' };
	const settlement = await settleOrKeepFailed(book, poster, notice, {
		rowId,
		amountPence: claim.amountPence
	});
	await book.settle(rowId, settlement);
	return { outcome: settlement.outcome };
}

async function settleOrKeepFailed(
	book: StripeEventBook,
	poster: StripeBooksPoster,
	notice: StripeNotice,
	claimed: { rowId: string; amountPence: number }
): Promise<StripeEventSettlement> {
	try {
		return await settle(book, poster, notice);
	} catch (failure) {
		await book.settle(claimed.rowId, failedSettlement(claimed.amountPence));
		throw failure;
	}
}

function settle(book: StripeEventBook, poster: StripeBooksPoster, notice: StripeNotice): Promise<StripeEventSettlement> {
	if (notice.kind === StripeNoticeKinds.payment) return settleStripePayment(book, poster, notice);
	return settleStripeRefund(book, poster, notice);
}

function claimOf(notice: StripeNotice): StripeEventClaim {
	const { eventId, eventType, paymentIntentId, currency } = notice;
	if (notice.kind === StripeNoticeKinds.payment)
		return {
			eventId,
			eventType,
			paymentIntentId,
			currency,
			amountPence: notice.amountPence,
			payerEmail: notice.payerEmail
		};
	return {
		eventId,
		eventType,
		paymentIntentId,
		currency,
		amountPence: notice.refundedToPence,
		payerEmail: ''
	};
}
