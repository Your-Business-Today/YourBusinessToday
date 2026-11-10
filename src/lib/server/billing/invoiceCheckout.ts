import { toPence } from '$lib/data/books/money';
import { amountOwedOn, isPayable, type BilledInvoice } from '$lib/data/billing/billedInvoice';
import { CheckoutSessionStatuses, type CheckoutGateway, type CheckoutSession } from './checkoutGateway';
import type { InvoiceCheckoutSessions } from './invoiceCheckoutSessions';

/** Who is paying, and the pages Stripe sends them back to. */
export type CheckoutPayer = { email: string; paidUrl: string; cancelledUrl: string };

/** Where the client is sent to pay, or why they cannot be. */
export type CheckoutOpening = { url: string } | { refusal: string };

const alreadyPaid = 'This invoice has been paid through Stripe; it shows as paid here once the payment is recorded.';
const nothingToPay = 'This invoice has nothing left to pay.';
const openedElsewhere = 'The payment page for this invoice was opened a moment ago elsewhere; press Pay again to open it.';

/**
 * The payment page for what the invoice still owes. The page opened before is opened again while it asks for that
 * amount; one asking for an amount since changed is expired first, so two pages can never both be paid.
 */
export async function openInvoiceCheckout(
	gateway: CheckoutGateway,
	sessions: InvoiceCheckoutSessions,
	invoice: BilledInvoice,
	payer: CheckoutPayer
): Promise<CheckoutOpening> {
	if (!isPayable(invoice)) return { refusal: nothingToPay };
	const place = { organisationId: invoice.organisationId, invoiceId: invoice.id };
	const amountPence = toPence(amountOwedOn(invoice));
	const heldSessionId = await sessions.findHeld(place);
	const held = heldSessionId === null ? null : await gateway.findSession(heldSessionId);
	if (held?.status === CheckoutSessionStatuses.complete) return { refusal: alreadyPaid };
	const reopened = await reopenOrExpire(gateway, held, amountPence);
	if (reopened !== null) return { url: reopened };
	const order = { invoiceId: invoice.id, organisationId: invoice.organisationId, printedNumber: invoice.printedNumber, amountPence };
	const opened = await gateway.openSession({ ...order, payerEmail: payer.email, paidUrl: payer.paidUrl, cancelledUrl: payer.cancelledUrl });
	const isKept = await sessions.replaceHeld(place, heldSessionId, opened.id);
	if (!isKept || opened.url === null) return withdrawn(gateway, opened);
	return { url: opened.url };
}

/** The held page's address while it is open for the amount owed; an open page for another amount is expired. */
async function reopenOrExpire(gateway: CheckoutGateway, held: CheckoutSession | null, amountPence: number): Promise<string | null> {
	if (held === null || held.status !== CheckoutSessionStatuses.open) return null;
	if (held.amountPence === amountPence && held.url !== null) return held.url;
	await gateway.expireSession(held.id);
	return null;
}

async function withdrawn(gateway: CheckoutGateway, opened: CheckoutSession): Promise<CheckoutOpening> {
	await gateway.expireSession(opened.id);
	return { refusal: openedElsewhere };
}
