import { fromPence } from '$lib/data/books/money';
import { StripeEventOutcomes, poundSterling } from '$lib/data/billing/stripeEventRules';
import type { StripeRefundNotice } from '$lib/data/billing/stripeNotice';
import { BooksRefusal } from '$lib/server/books/booksRefusal';
import type { StripeBooksPoster } from './stripeBooksPoster';
import type { PostedStripePayment, StripeEventBook, StripeEventSettlement } from './stripeEventBook';
import { ignoredBecause, unmatchedBecause } from './stripeSettlements';

const nothing = 0;

/**
 * Posts money refunded on a payment the books posted, as an entry of its own on the invoice it paid: only what is
 * refunded beyond the refunds already posted, since Stripe reports the total refunded on the charge each time. A
 * refund on a payment the books never posted is kept as unmatched with the reason, for an administrator.
 */
export async function settleStripeRefund(
	book: StripeEventBook,
	poster: StripeBooksPoster,
	notice: StripeRefundNotice
): Promise<StripeEventSettlement> {
	const { paymentIntentId, chargeId, currency, refundedToPence } = notice;
	if (currency !== poundSterling)
		return unmatchedBecause(`Charge ${chargeId} was refunded in ${currency}; the books hold ${poundSterling} only.`, refundedToPence);
	const payment = paymentIntentId === null ? null : await book.findPostedPayment(paymentIntentId);
	if (payment === null)
		return unmatchedBecause(`Charge ${chargeId} was refunded, but the books never posted its payment.`, refundedToPence);
	const refundedBefore = await book.findRefundedPence(paymentIntentId as string);
	const newlyRefundedPence = refundedToPence - refundedBefore;
	if (newlyRefundedPence <= nothing) return ignoredBecause(`Everything refunded on charge ${chargeId} is already posted.`);
	return postRefund(poster, notice, payment, newlyRefundedPence);
}

async function postRefund(
	poster: StripeBooksPoster,
	notice: StripeRefundNotice,
	payment: PostedStripePayment,
	amountPence: number
): Promise<StripeEventSettlement> {
	const { organisationId, invoiceId } = payment;
	try {
		const journalId = await poster.postRefund(organisationId, {
			invoiceId,
			amount: fromPence(amountPence),
			refundedOn: notice.happenedOn
		});
		return {
			outcome: StripeEventOutcomes.posted,
			reason: '',
			organisationId,
			invoiceId,
			amountPence,
			journalId
		};
	} catch (failure) {
		if (!(failure instanceof BooksRefusal)) throw failure;
		return unmatchedBecause(`Charge ${notice.chargeId} refunded, but the books refused it: ${failure.message}`, amountPence);
	}
}
