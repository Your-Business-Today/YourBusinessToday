import type { EmailDelivery } from '$lib/data/emailDelivery';
import { isEmailShaped } from '$lib/data/emailShape';
import type { DocumentParty } from './invoiceDocument';
import { InvoiceStatuses, type InvoiceStatus } from './invoiceStatuses';

/** One time an invoice was emailed, as books_invoice_sendings keeps it (migration 0222). */
export type InvoiceSending = { sentTo: string; delivery: EmailDelivery; sentByAccountId: string | null; sentAt: string };

/** The limits of books_invoice_sendings.sent_to, stated once for the action's field and the service's check. */
export const sentToLimits = { shortest: 3, longest: 254 } as const;

/** The statuses an invoice is never emailed in: a draft is not yet owed, and a void one is cancelled. */
const unsendableStatuses: ReadonlySet<InvoiceStatus> = new Set([InvoiceStatuses.draft, InvoiceStatuses.void]);

/** Why the address given in place of the customer's cannot be sent to, or null when it can, or when none was given. */
export function sendToRefusal(to: unknown): string | null {
	if (to === undefined || to === null) return null;
	const example = 'such as accounts@example.com';
	if (typeof to !== 'string') return `to is the address to send the invoice to, ${example}; ${JSON.stringify(to)} was given.`;
	if (to.length > sentToLimits.longest) return `to is at most ${sentToLimits.longest} characters; ${to.length} were given.`;
	if (isEmailShaped(to)) return null;
	return `to is the address to send the invoice to, ${example}; ${JSON.stringify(to)} was given.`;
}

/** Why an invoice in this status is not emailed, or null when it may be. */
export function sendingStatusRefusal(printedNumber: string, status: InvoiceStatus): string | null {
	if (!unsendableStatuses.has(status)) return null;
	return `Invoice ${printedNumber} is ${status}, and only an issued or paid invoice is emailed to its customer.`;
}

/** Where the invoice goes: the address the person gave, or else the customer's email in the books. */
export function recipientOf(to: unknown, customer: DocumentParty): string {
	if (typeof to === 'string') return to;
	return customer.email;
}

/** Why the invoice has nowhere to go, or null when it has an address. */
export function noRecipientRefusal(printedNumber: string, customer: DocumentParty, recipient: string): string | null {
	if (recipient !== '') return null;
	return `Invoice ${printedNumber} has nowhere to go: ${customer.name} has no email in the books. Give to, or set their email with update_customer.`;
}
