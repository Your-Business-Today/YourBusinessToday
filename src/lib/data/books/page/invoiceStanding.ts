import { daysBetween } from '$lib/data/demo/demoDates';
import { InvoiceStatuses, type InvoiceStatus } from '$lib/data/books/invoiceStatuses';
import { differenceOf } from '$lib/data/books/money';

/** What an invoice holds that says where it stands: its status, due date, total and what has been paid on it. */
export type InvoiceAmounts = { status: InvoiceStatus; dueDate: string; total: number; amountPaid: number };

const nothingOwed = 0;

/** What the customer still owes on an invoice: only an issued one is owed, and only what is left after payments. */
export function owedOn(invoice: InvoiceAmounts): number {
	if (invoice.status !== InvoiceStatuses.issued) return nothingOwed;
	return differenceOf(invoice.total, invoice.amountPaid);
}

/** How many days past its due date an issued invoice is today, or null when it is not overdue or not owed. */
export function daysOverdueOn(invoice: InvoiceAmounts, today: string): number | null {
	if (invoice.status !== InvoiceStatuses.issued) return null;
	const daysPastDue = daysBetween(invoice.dueDate, today);
	if (daysPastDue <= 0) return null;
	return daysPastDue;
}
