/** Where a Stripe Checkout session stands: open to be paid, paid, or expired unpaid. */
export const CheckoutSessionStatuses = { open: 'open', complete: 'complete', expired: 'expired' } as const;

export type CheckoutSessionStatus = (typeof CheckoutSessionStatuses)[keyof typeof CheckoutSessionStatuses];

/** A payment page Stripe holds for one invoice, and what it asks for in pence. */
export type CheckoutSession = { id: string; url: string | null; status: CheckoutSessionStatus; amountPence: number };

/** What a client is asked to pay for one invoice, and where Stripe sends them afterwards. */
export type CheckoutOrder = {
	invoiceId: string;
	organisationId: string;
	printedNumber: string;
	amountPence: number;
	payerEmail: string;
	paidUrl: string;
	cancelledUrl: string;
};

/** The payment pages the Billing section opens: Stripe's Checkout, or a stand-in in tests. */
export type CheckoutGateway = {
	findSession: (sessionId: string) => Promise<CheckoutSession | null>;
	openSession: (order: CheckoutOrder) => Promise<CheckoutSession>;
	expireSession: (sessionId: string) => Promise<void>;
};

/** The metadata every session carries, so the payment Stripe reports back finds its invoice in the books. */
export const checkoutMetadataKeys = {
	invoiceId: 'books_invoice_id',
	organisationId: 'books_organisation_id',
	printedNumber: 'invoice_number'
} as const;

export function checkoutMetadataOf(order: CheckoutOrder): Record<string, string> {
	return {
		[checkoutMetadataKeys.invoiceId]: order.invoiceId,
		[checkoutMetadataKeys.organisationId]: order.organisationId,
		[checkoutMetadataKeys.printedNumber]: order.printedNumber
	};
}
