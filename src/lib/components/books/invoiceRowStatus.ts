import type { BadgeTone } from '$lib/components/site/badgeTones';
import type { InvoiceRow } from '$lib/data/books/page/invoiceRows';
import { invoiceStatusLabels, invoiceStatusTones } from './invoiceDocumentView';

/** The badge an invoice row carries: its status, or how many days overdue an issued one is. */
export type InvoiceRowStatus = { label: string; tone: BadgeTone };

const overdueTone: BadgeTone = 'negative';

export function invoiceRowStatusOf(row: InvoiceRow): InvoiceRowStatus {
	if (row.daysOverdue === null) return { label: invoiceStatusLabels[row.status], tone: invoiceStatusTones[row.status] };
	const days = row.daysOverdue === 1 ? '1 day' : `${row.daysOverdue} days`;
	return { label: `Overdue ${days}`, tone: overdueTone };
}
