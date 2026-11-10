import { findBilledInvoices } from '$lib/server/billing/billedInvoices';
import { isStripeCheckoutOpen } from '$lib/server/billing/stripeSecretKey';
import { requireLinkedPortalVisitor } from '$lib/server/portal/requireLinkedPortalVisitor';
import { supabaseServiceClient } from '$lib/server/payments/supabaseServiceClient';
import { billingFields } from '$lib/portal/billingFields';
import { portalBillingActions } from './portalBillingActions';
import type { Actions, PageServerLoad } from './$types';

/** The invoices Your Business Today has raised to the client the portal works in, and whether they can be paid here. */
export const load: PageServerLoad = async (page) => {
	const visitor = await requireLinkedPortalVisitor(page);
	const invoices = await findBilledInvoices(supabaseServiceClient(), visitor.clientId);
	const { searchParams } = page.url;
	const paidInvoiceId = searchParams.get(billingFields.paidInvoiceId);
	const paidInvoice = invoices.find((invoice) => invoice.id === paidInvoiceId) ?? null;
	return { visitor, invoices, isPayingOpen: isStripeCheckoutOpen(), paidPrintedNumber: paidInvoice?.printedNumber ?? null };
};

export const actions: Actions = portalBillingActions;
