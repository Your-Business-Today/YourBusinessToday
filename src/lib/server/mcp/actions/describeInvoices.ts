import { formatBritishDate } from '$lib/data/britishDate';
import { differenceOf, formatPoundsAndPence } from '$lib/data/books/money';
import type { InvoiceStatus } from '$lib/data/books/invoiceStatuses';
import type { InvoiceInFull, InvoiceSummary } from '$lib/server/books/invoices';
import type { InvoiceLine } from '$lib/server/books/invoiceRecord';
import type { InvoicePayment } from '$lib/server/books/invoicePayments';
import { invoiceNumberAsPrinted, type InvoiceNamings } from '$lib/server/books/invoiceNamings';
import { nameOf } from '$lib/server/books/chartNamings';

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

/** The invoices shown, newest first, each on one line, or that the books hold none the filter lets through. */
export function describeInvoiceList(organisationName: string, invoices: InvoiceSummary[], namings: InvoiceNamings): string {
	if (invoices.length === 0) return `${organisationName}'s books hold no invoices that match.`;
	return [`Invoices of ${organisationName}, newest first:`, ...invoices.map((invoice) => describeSummary(invoice, namings))].join('\n');
}

function describeSummary(invoice: InvoiceSummary, namings: InvoiceNamings): string {
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
