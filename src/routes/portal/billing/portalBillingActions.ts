import { fail, redirect } from '@sveltejs/kit';
import { validateRecordId } from '$lib/data/isUuid';
import { findBilledInvoice } from '$lib/server/billing/billedInvoices';
import { booksCheckoutSessions } from '$lib/server/billing/invoiceCheckoutSessions';
import { openInvoiceCheckout, type CheckoutPayer } from '$lib/server/billing/invoiceCheckout';
import { stripeCheckoutGateway } from '$lib/server/billing/stripeCheckoutGateway';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { isRefusal, textOf } from '$lib/server/portal/portalFormReading';
import { billingFields } from '$lib/portal/billingFields';
import { portalBillingPath } from '$lib/portal/portalPaths';
import type { PortalVisitor } from '$lib/portal/portalVisitor';
import type { Actions } from './$types';

const badRequest = 400;
const notFound = 404;
const serviceUnavailable = 503;
const seeOther = 303;
const payingNotOpen = 'Paying by card is not open yet. Your Business Today will tell you when it is.';
const notYourInvoice = 'There is no such invoice for your organisation.';

export const portalBillingActions = {
	pay: async ({ locals, request, url }) => {
		const visitor = await requirePortalVisitor(locals);
		const invoiceId = textOf(await request.formData(), billingFields.invoiceId);
		const idRefusal = validateRecordId('invoice', invoiceId);
		if (idRefusal !== null) return fail(badRequest, { message: idRefusal });
		const gateway = stripeCheckoutGateway();
		if (gateway === null) return fail(serviceUnavailable, { message: payingNotOpen });
		const service = supabaseServiceClient();
		const invoice = await findBilledInvoice(service, visitor.clientId, invoiceId);
		if (invoice === null) return fail(notFound, { message: notYourInvoice });
		const opening = await openInvoiceCheckout(gateway, booksCheckoutSessions(service), invoice, payerOf(visitor, url, invoiceId));
		if (isRefusal(opening)) return fail(badRequest, { message: opening.refusal });
		redirect(seeOther, opening.url);
	}
} satisfies Actions;

/** The contact paying, sent back to Billing afterwards, with the invoice named when they have paid it. */
function payerOf(visitor: PortalVisitor, url: URL, invoiceId: string): CheckoutPayer {
	const billingUrl = new URL(portalBillingPath, url.origin);
	const paidUrl = new URL(billingUrl);
	paidUrl.searchParams.set(billingFields.paidInvoiceId, invoiceId);
	return { email: visitor.emailAddress, paidUrl: paidUrl.href, cancelledUrl: billingUrl.href };
}
