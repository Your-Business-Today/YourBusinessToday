import { billingFields } from '$lib/portal/billingFields';
import { portalBillingPath } from '$lib/portal/portalPaths';
import type { CheckoutPayer } from './invoiceCheckout';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

export const payingNotOpen = 'Paying by card is not open yet. Your Business Today will tell you when it is.';
export const notYourInvoice = 'There is no such invoice for your organisation.';

/** The contact paying, sent back to Billing afterwards, with the invoice named when they have paid it. */
export function checkoutPayerOf(visitor: PortalVisitor, origin: string, invoiceId: string): CheckoutPayer {
	const billingUrl = new URL(portalBillingPath, origin);
	const paidUrl = new URL(billingUrl);
	paidUrl.searchParams.set(billingFields.paidInvoiceId, invoiceId);
	return { email: visitor.emailAddress, paidUrl: paidUrl.href, cancelledUrl: billingUrl.href };
}
