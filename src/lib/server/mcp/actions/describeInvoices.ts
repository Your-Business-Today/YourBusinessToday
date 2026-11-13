import { formatBritishDate } from '$lib/data/britishDate';
import { booksInvoiceAddressOf } from '$lib/data/books/page/booksPaths';
import { differenceOf, formatPoundsAndPence } from '$lib/data/books/money';
import type { InvoiceStatus } from '$lib/data/books/invoiceStatuses';
import type { InvoiceInFull, InvoiceSummary } from '$lib/server/books/invoices';
import type { InvoiceLine } from '$lib/server/books/invoiceRecord';
import type { InvoicePayment } from '$lib/server/books/invoicePayments';
import { invoiceNumberAsPrinted, type InvoiceNamings } from '$lib/server/books/invoiceNamings';
import { nameOf } from '$lib/server/books/chartNamings';
import { neverSentMarkOf } from './describeInvoiceSendings';

/** One invoice in full: who it is to, its dates, every line with its account and cost centre, and its totals. */
export function describeInvoiceInFull(invoice: InvoiceInFull, namings: InvoiceNamings): string {
	return [
		`Invoice ${invoiceNumberAsPrinted(namings, invoice.invoiceNumber)}, ${invoice.status}. Id ${invoice.id}`,
		`To ${nameOf(namings.customerNames, invoice.customerId)} (customer ${invoice.customerId})`,
		`Dated ${formatBritishDate(invoice.issueDate)}, due ${formatBritishDate(invoice.dueDate)}`,
		...printedOnlyWhenGiven('Reference', invoice.reference),
		'Lines:',
		...invoice.lines.map((line) => describeLine(line, namings)),
		...describePayments(invoice.payments),
		describeAmounts(invoice),
		...printedOnlyWhenGiven('Notes', invoice.notes)
	].join('\n');
}

/** The organisation whose books are read: its id for each invoice's address, and its name. */
type BooksOrganisation = { id: string; name: string };

/** What a list of invoices is told: the invoices, newest first, how each is named, and which were ever emailed. */
export type InvoiceListing = { invoices: InvoiceSummary[]; namings: InvoiceNamings; sentInvoiceIds: ReadonlySet<string> };

/** The invoices shown, each on one line with the address it opens at and a mark on any issued but never emailed, or that the books hold none that match. */
export function describeInvoiceList(organisation: BooksOrganisation, listing: InvoiceListing): string {
	const { invoices, namings, sentInvoiceIds } = listing;
	if (invoices.length === 0) return `${organisation.name}'s books hold no invoices that match.`;
	const lineOf = (invoice: InvoiceSummary) => `${describeInvoiceSummary(invoice, namings)}${neverSentMarkOf(invoice, sentInvoiceIds)}`;
	const lines = invoices.map((invoice) => `${lineOf(invoice)}; opens at ${booksInvoiceAddressOf(organisation.id, invoice.id)}`);
	return [`Invoices of ${organisation.name}, newest first:`, ...lines].join('\n');
}

/** One invoice on one line: its number, customer, status, dates, total and what is owed, with its id. */
export function describeInvoiceSummary(invoice: InvoiceSummary, namings: InvoiceNamings): string {
	const number = invoiceNumberAsPrinted(namings, invoice.invoiceNumber);
	const customer = nameOf(namings.customerNames, invoice.customerId);
	const dates = `dated ${formatBritishDate(invoice.issueDate)}, due ${formatBritishDate(invoice.dueDate)}`;
	return `- ${number} to ${customer}, ${invoice.status}, ${dates}; ${describeAmounts(invoice)}. Id ${invoice.id}`;
}

function describeLine(line: InvoiceLine, namings: InvoiceNamings): string {
	const workings = `${line.quantity} × ${formatPoundsAndPence(line.unitPrice)} = ${formatPoundsAndPence(line.amount)}`;
	const account = `income account ${nameOf(namings.accountNames, line.incomeAccountId)}`;
	const costCentre = line.costCentreId === null ? '' : `, cost centre ${nameOf(namings.costCentreNames, line.costCentreId)}`;
	return `- ${line.description}: ${workings}; ${account}${costCentre}`;
}

/** What the customer owes on an invoice in each status, given what it has paid and what is left. */
const owingInStatus: Record<InvoiceStatus, (paid: string, owed: string) => string> = {
	draft: () => 'not owed until it is issued',
	issued: (paid, owed) => `paid ${paid}, owed ${owed}`,
	paid: (paid) => `paid ${paid}, nothing owed`,
	void: () => 'void, so nothing is owed'
};

function describeAmounts(invoice: InvoiceSummary): string {
	const owed = differenceOf(invoice.total, invoice.amountPaid);
	const owing = owingInStatus[invoice.status](formatPoundsAndPence(invoice.amountPaid), formatPoundsAndPence(owed));
	return `Total ${formatPoundsAndPence(invoice.total)}, ${owing}`;
}

function describePayments(payments: InvoicePayment[]): string[] {
	if (payments.length === 0) return [];
	return ['Payments:', ...payments.map((payment) => `- ${formatBritishDate(payment.paidOn)}: ${formatPoundsAndPence(payment.amount)}`)];
}

function printedOnlyWhenGiven(label: string, value: string): string[] {
	if (value === '') return [];
	return [`${label}: ${value}`];
}
