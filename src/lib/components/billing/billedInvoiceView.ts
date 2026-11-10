import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence, toPence } from '$lib/data/books/money';
import { BillingStandings, billingStandingOf, type BilledInvoice, type BillingStanding } from '$lib/data/billing/billedInvoice';
import type { BadgeTone } from '$lib/components/site/badgeTones';

/** One fact shown under an invoice's heading: its dates, its reference and what is left to pay. */
export type InvoiceFact = { label: string; value: string };

export const billingStandingTones: Record<BillingStanding, BadgeTone> = {
	unpaid: 'warning',
	paid: 'positive',
	cancelled: 'neutral'
};

/** The invoice's dates and reference, and while it is unpaid what has been paid on it and what is left to pay. */
export function invoiceFactsOf(invoice: BilledInvoice, amountOwed: number): InvoiceFact[] {
	const dates = [
		{ label: 'Issued', value: formatBritishDate(invoice.issueDate) },
		{ label: 'Due', value: formatBritishDate(invoice.dueDate) }
	];
	const reference = invoice.reference === '' ? [] : [{ label: 'Reference', value: invoice.reference }];
	return [...dates, ...reference, ...moneyFactsOf(invoice, amountOwed)];
}

function moneyFactsOf(invoice: BilledInvoice, amountOwed: number): InvoiceFact[] {
	const isUnpaid = billingStandingOf(invoice) === BillingStandings.unpaid;
	if (!isUnpaid) return [];
	const hasPaidSome = toPence(invoice.amountPaid) > 0;
	const paidSoFar = hasPaidSome ? [{ label: 'Paid so far', value: formatPoundsAndPence(invoice.amountPaid) }] : [];
	return [...paidSoFar, { label: 'To pay', value: formatPoundsAndPence(amountOwed) }];
}
