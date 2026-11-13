import { formatPoundsAndPence, sumMoney } from '$lib/data/books/money';
import { InvoiceStatuses, type InvoiceStatus } from '$lib/data/books/invoiceStatuses';

/** An invoice as the Invoices page lists it: its number, customer, dates, total, what is owed, status and when it was last emailed. */
export type InvoiceRow = {
	id: string;
	number: string;
	invoiceNumber: number;
	customer: string;
	dated: string;
	due: string;
	total: number;
	owed: number;
	status: InvoiceStatus;
	daysOverdue: number | null;
	sentAt: string | null;
};

export const invoiceTabKeys = ['all', 'draft', 'unpaid', 'paid', 'void'] as const;

export type InvoiceTabKey = (typeof invoiceTabKeys)[number];

const isOnTab: Record<InvoiceTabKey, (row: InvoiceRow) => boolean> = {
	all: () => true,
	draft: (row) => row.status === InvoiceStatuses.draft,
	unpaid: (row) => row.status === InvoiceStatuses.issued,
	paid: (row) => row.status === InvoiceStatuses.paid,
	void: (row) => row.status === InvoiceStatuses.void
};

const notOverdue = -1;
const overdueFirstTab: InvoiceTabKey = 'unpaid';

/** The invoices a tab lists, newest number first; Unpaid puts the longest overdue first. */
export function invoicesOnTab(rows: InvoiceRow[], tabKey: InvoiceTabKey): InvoiceRow[] {
	const listed = rows.filter(isOnTab[tabKey]);
	if (tabKey !== overdueFirstTab) return listed;
	return [...listed].sort(longestOverdueFirst);
}

function longestOverdueFirst(first: InvoiceRow, second: InvoiceRow): number {
	const overdueFirst = (second.daysOverdue ?? notOverdue) - (first.daysOverdue ?? notOverdue);
	if (overdueFirst !== 0) return overdueFirst;
	return second.invoiceNumber - first.invoiceNumber;
}

/** What customers owe, in one line: the sum of the unpaid invoices, how many there are, and how much of it is overdue. */
export function describeOwedByCustomers(rows: InvoiceRow[]): string {
	const unpaid = invoicesOnTab(rows, overdueFirstTab);
	if (unpaid.length === 0) return 'Nothing is owed by customers.';
	const owed = formatPoundsAndPence(sumMoney(unpaid.map((row) => row.owed)));
	const unpaidInvoices = unpaid.length === 1 ? 'one unpaid invoice' : `${unpaid.length} unpaid invoices`;
	const overdue = unpaid.filter((row) => row.daysOverdue !== null);
	const overdueOwed = formatPoundsAndPence(sumMoney(overdue.map((row) => row.owed)));
	const overduePart = overdue.length === 0 ? '' : `, ${overdueOwed} of it overdue`;
	return `${owed} is owed by customers, across ${unpaidInvoices}${overduePart}.`;
}
