import { validateRecordId } from '$lib/data/isUuid';
import { fromPence } from '$lib/data/books/money';
import { StripeEventOutcomes, poundSterling } from '$lib/data/billing/stripeEventRules';
import type { StripePaymentNotice } from '$lib/data/billing/stripeNotice';
import { BooksRefusal } from '$lib/server/books/booksRefusal';
import { UnsettledBooksStep } from '$lib/server/books/booksStep';
import type { StripeBooksPoster } from './stripeBooksPoster';
import type { StripeEventBook, StripeEventSettlement } from './stripeEventBook';
import { ignoredBecause, unmatchedBecause } from './stripeSettlements';

/**
 * Posts a paid Checkout page to the invoice its metadata names, which marks the invoice paid once nothing is left
 * owing. A payment naming no invoice the books hold, or one the invoice cannot take, is kept as unmatched with the
 * reason for an administrator to deal with; the same payment reported by a second event posts once. So is one whose
 * posting could not be told to have happened or not, rather than letting Stripe send it again and post it twice.
 */
export async function settleStripePayment(book: StripeEventBook, poster: StripeBooksPoster, notice: StripePaymentNotice): Promise<StripeEventSettlement> {
	const mismatch = paymentMismatch(notice);
	if (mismatch !== null) return unmatchedBecause(mismatch, notice.amountPence);
	const posted = notice.paymentIntentId === null ? null : await book.findPostedPayment(notice.paymentIntentId);
	if (posted !== null) return ignoredBecause(`Payment ${notice.paymentIntentId} is already posted to the books.`);
	const organisationId = notice.organisationId as string;
	const invoiceId = notice.invoiceId as string;
	try {
		const payment = { invoiceId, paidOn: notice.happenedOn, amount: fromPence(notice.amountPence) };
		const journalId = await poster.recordPayment(organisationId, payment);
		return { outcome: StripeEventOutcomes.posted, reason: '', organisationId, invoiceId, amountPence: notice.amountPence, journalId };
	} catch (failure) {
		if (failure instanceof UnsettledBooksStep) return unmatchedBecause(`Checkout ${notice.sessionId} paid: ${failure.message}`, notice.amountPence);
		if (!(failure instanceof BooksRefusal)) throw failure;
		return unmatchedBecause(`Checkout ${notice.sessionId} paid, but the books refused it: ${failure.message}`, notice.amountPence);
	}
}

function paymentMismatch(notice: StripePaymentNotice): string | null {
	const { sessionId, currency, invoiceId, organisationId } = notice;
	if (currency !== poundSterling) return `Checkout ${sessionId} was paid in ${currency}; the books take payments in ${poundSterling} only.`;
	const namesNoInvoice = invoiceId === null || organisationId === null;
	if (namesNoInvoice) return `Checkout ${sessionId} names no invoice in Your Business Today's books.`;
	const idRefusal = validateRecordId('invoice', invoiceId) ?? validateRecordId('organisation', organisationId);
	if (idRefusal === null) return null;
	return `Checkout ${sessionId} names invoice ${invoiceId} in organisation ${organisationId}: ${idRefusal}`;
}
