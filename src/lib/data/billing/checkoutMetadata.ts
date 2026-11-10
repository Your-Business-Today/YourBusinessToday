/** The invoice a payment page is opened for: its id, the books it is in, and its number as printed. */
export type CheckoutMetadataOrder = { invoiceId: string; organisationId: string; printedNumber: string };

/** The metadata every session carries, so the payment Stripe reports back finds its invoice in the books. */
export const checkoutMetadataKeys = {
	invoiceId: 'books_invoice_id',
	organisationId: 'books_organisation_id',
	printedNumber: 'invoice_number'
} as const;

export function checkoutMetadataOf(order: CheckoutMetadataOrder): Record<string, string> {
	return {
		[checkoutMetadataKeys.invoiceId]: order.invoiceId,
		[checkoutMetadataKeys.organisationId]: order.organisationId,
		[checkoutMetadataKeys.printedNumber]: order.printedNumber
	};
}
