import type { SupabaseClient } from '@supabase/supabase-js';
import { postInvoiceRefund, type InvoiceRefund } from '$lib/server/books/postInvoiceRefund';
import { recordInvoicePayment } from '$lib/server/books/recordInvoicePayment';
import type { InvoicePaymentInput } from '$lib/data/books/invoiceMoveRules';

/** Money received against an invoice the books are asked to post, in pounds, on the UK day it arrived. */
export type StripeInvoicePayment = InvoicePaymentInput & { invoiceId: string };

/**
 * What the webhook posts to the books: a payment against an invoice, answering its journal, and a refund on one.
 * A payment or refund the books cannot take is refused with a BooksRefusal naming why.
 */
export type StripeBooksPoster = {
	recordPayment: (organisationId: string, payment: StripeInvoicePayment) => Promise<string>;
	postRefund: (organisationId: string, refund: InvoiceRefund) => Promise<string>;
};

/** The books themselves, written with the service key: Stripe's signature is the webhook's gate. */
export function stripeBooksPoster(service: SupabaseClient): StripeBooksPoster {
	return {
		recordPayment: async (organisationId, payment) => {
			const recorded = await recordInvoicePayment(service, organisationId, payment);
			return recorded.journalId;
		},
		postRefund: (organisationId, refund) => postInvoiceRefund(service, organisationId, refund)
	};
}
