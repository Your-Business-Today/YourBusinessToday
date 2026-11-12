import { fail, redirect } from '@sveltejs/kit';
import { validateRecordId } from '$lib/data/isUuid';
import { findBilledInvoice } from '$lib/server/billing/billedInvoices';
import { booksCheckoutSessions } from '$lib/server/billing/invoiceCheckoutSessions';
import { openInvoiceCheckout } from '$lib/server/billing/invoiceCheckout';
import { checkoutPayerOf, notYourInvoice, payingNotOpen } from '$lib/server/billing/payingAnInvoice';
import { stripeCheckoutGateway } from '$lib/server/billing/stripeCheckoutGateway';
import { requirePortalVisitor } from '$lib/server/portal/requirePortalVisitor';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { isRefusal, textOf } from '$lib/server/portal/portalFormReading';
import { billingFields } from '$lib/portal/billingFields';
import type { Actions } from './$types';

const badRequest = 400;
const notFound = 404;
const serviceUnavailable = 503;
const seeOther = 303;

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
		const payer = checkoutPayerOf(visitor, url.origin, invoiceId);
		const opening = await openInvoiceCheckout(gateway, booksCheckoutSessions(service), invoice, payer);
		if (isRefusal(opening)) return fail(badRequest, { message: opening.refusal });
		redirect(seeOther, opening.url);
	}
} satisfies Actions;
