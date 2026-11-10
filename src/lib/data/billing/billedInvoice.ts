import { differenceOf, toPence } from '$lib/data/books/money';
import { InvoiceStatuses, type InvoiceStatus } from '$lib/data/books/invoiceStatuses';

/** One line of an invoice as the client reads it. */
export type BilledLine = { id: string; description: string; quantity: number; unitPrice: number; amount: number };

/** An invoice Your Business Today has raised to a client, as their Billing section shows it. */
export type BilledInvoice = {
	id: string;
	organisationId: string;
	printedNumber: string;
	status: InvoiceStatus;
	issueDate: string;
	dueDate: string;
	reference: string;
	lines: BilledLine[];
	total: number;
	amountPaid: number;
};

/** Where an invoice stands for the client: still to pay, paid, or cancelled. */
export const BillingStandings = { unpaid: 'unpaid', paid: 'paid', cancelled: 'cancelled' } as const;

export type BillingStanding = (typeof BillingStandings)[keyof typeof BillingStandings];

export const billingStandingLabels: Record<BillingStanding, string> = {
	unpaid: 'Unpaid',
	paid: 'Paid',
	cancelled: 'Cancelled'
};

const standingOfStatus: Record<InvoiceStatus, BillingStanding> = {
	draft: BillingStandings.unpaid,
	issued: BillingStandings.unpaid,
	paid: BillingStandings.paid,
	void: BillingStandings.cancelled
};

/** A draft has not been raised to the client, so only the other statuses are billed. */
export const billedStatuses: InvoiceStatus[] = [InvoiceStatuses.issued, InvoiceStatuses.paid, InvoiceStatuses.void];

export function isBilled(status: InvoiceStatus): boolean {
	return billedStatuses.includes(status);
}

export function billingStandingOf(invoice: BilledInvoice): BillingStanding {
	return standingOfStatus[invoice.status];
}

/** What the invoice still owes: its total less what has been paid on it, to the penny. */
export function amountOwedOn(invoice: BilledInvoice): number {
	return differenceOf(invoice.total, invoice.amountPaid);
}

/** An issued invoice that still owes something can be paid; a paid or cancelled one cannot. */
export function isPayable(invoice: BilledInvoice): boolean {
	const isIssued = invoice.status === InvoiceStatuses.issued;
	return isIssued && toPence(amountOwedOn(invoice)) > 0;
}
