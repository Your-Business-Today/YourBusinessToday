import { formatUkDayAndTime } from '$lib/data/britishDate';
import type { InvoiceSending } from '$lib/data/books/invoiceSendingRules';
import { InvoiceStatuses, type InvoiceStatus } from '$lib/data/books/invoiceStatuses';
import type { EmailDelivery } from '$lib/data/emailDelivery';

const deliveryWords: Record<EmailDelivery, string> = {
	sent: 'sent',
	skipped: 'not sent, as email is not set up here',
	failed: 'could not be sent'
};

const neverSentMark = '; issued but never emailed';

/** Every time the invoice was emailed, oldest first, or that an issued invoice has not been emailed yet. */
export function describeSendings(status: InvoiceStatus, sendings: InvoiceSending[]): string[] {
	const isIssued = status === InvoiceStatuses.issued;
	if (sendings.length === 0 && isIssued) return ['Not yet emailed to the customer; send_invoice sends it.'];
	if (sendings.length === 0) return [];
	return ['Emailed:', ...sendings.map(describeSending)];
}

/** What an issued invoice's line in a list adds when it has never been emailed. */
export function neverSentMarkOf(invoice: { id: string; status: InvoiceStatus }, sentInvoiceIds: ReadonlySet<string>): string {
	const isIssued = invoice.status === InvoiceStatuses.issued;
	if (!isIssued || sentInvoiceIds.has(invoice.id)) return '';
	return neverSentMark;
}

function describeSending(sending: InvoiceSending): string {
	const sender = sending.sentByAccountId === null ? ', by itself' : '';
	return `- ${formatUkDayAndTime(sending.sentAt)} to ${sending.sentTo}: ${deliveryWords[sending.delivery]}${sender}`;
}
