import { booksCheckoutSessions } from '$lib/server/billing/invoiceCheckoutSessions';
import { checkoutPayerOf, notYourInvoice, payingNotOpen } from '$lib/server/billing/payingAnInvoice';
import { clientIdField, describeVisitorStanding, portalVisitorOf } from '../portalVisitorAccess';
import { describeMyInvoices } from './describeMyInvoices';
import { findBilledInvoice, findBilledInvoices } from '$lib/server/billing/billedInvoices';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { amountOwedOn } from '$lib/data/billing/billedInvoice';
import { isRefusal } from '$lib/server/portal/portalFormReading';
import { isStripeCheckoutOpen } from '$lib/server/billing/stripeSecretKey';
import { objectSchema, readText, textField } from '../actionTypes';
import { openInvoiceCheckout } from '$lib/server/billing/invoiceCheckout';
import { portalAddress } from '$lib/portal/portalAddress';
import { stripeCheckoutGateway } from '$lib/server/billing/stripeCheckoutGateway';
import { validateRecordId } from '$lib/data/isUuid';
import type { McpAction } from '../actionTypes';
import type { McpCaller } from '../resolveMcpCaller';
import type { PortalVisitor } from '$lib/portal/portalVisitor';

export const portalBillingActions: McpAction[] = [
	{
		name: 'list_my_invoices',
		area: 'support',
		audience: 'everyone',
		isWrite: false,
		summary: 'for a client contact: the invoices Your Business Today has raised to your organisation, newest first, with what each still owes',
		inputSchema: objectSchema({ clientId: clientIdField }),
		run: async (caller, input) => {
			const visitor = await portalVisitorOf(caller, input);
			if (typeof visitor === 'string') return visitor;
			const invoices = await findBilledInvoices(caller.supabase, visitor.clientId);
			return `${describeVisitorStanding(visitor)}\n\n${describeMyInvoices(invoices, isStripeCheckoutOpen())}`;
		}
	},
	{
		name: 'pay_invoice',
		area: 'support',
		audience: 'everyone',
		isWrite: true,
		summary: "for a client contact: open Stripe's payment page for what one of your invoices still owes, and give the person its link",
		guidance:
			'Give the person the link as it is answered: the payment is theirs to make on the page. The Billing section in their ' +
			'portal shows the invoice paid once the payment is recorded.',
		inputSchema: objectSchema({ clientId: clientIdField, invoiceId: textField('The invoice id, as list_my_invoices gives it') }, ['invoiceId']),
		run: async (caller, input) => {
			const visitor = await portalVisitorOf(caller, input);
			if (typeof visitor === 'string') return visitor;
			return openPaymentPage(caller, visitor, readText(input, 'invoiceId'));
		}
	}
];

async function openPaymentPage(caller: McpCaller, visitor: PortalVisitor, invoiceId: string): Promise<string> {
	const idRefusal = validateRecordId('invoiceId', invoiceId);
	if (idRefusal !== null) return idRefusal;
	const gateway = stripeCheckoutGateway();
	if (gateway === null) return payingNotOpen;
	const invoice = await findBilledInvoice(caller.supabase, visitor.clientId, invoiceId);
	if (invoice === null) return notYourInvoice;
	const payer = checkoutPayerOf(visitor, portalAddress.origin, invoiceId);
	const opening = await openInvoiceCheckout(gateway, booksCheckoutSessions(caller.supabase), invoice, payer);
	if (isRefusal(opening)) return opening.refusal;
	const amountOwed = formatPoundsAndPence(amountOwedOn(invoice));
	return `Invoice ${invoice.printedNumber} owes ${amountOwed}. Pay it at ${opening.url} — the page is Stripe's, and the Billing section shows it paid once the payment is recorded.`;
}
