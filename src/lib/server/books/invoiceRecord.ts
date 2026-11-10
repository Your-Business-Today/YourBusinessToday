import { invoiceLineTotal } from '$lib/data/books/customerBalance';
import type { InvoiceHeading } from '$lib/data/books/invoiceDraftRules';
import type { InvoiceLineInput } from '$lib/data/books/invoiceLineRules';
import type { InvoiceStatus } from '$lib/data/books/invoiceStatuses';

/** An invoice as its organisation's books hold it, numbered and in a status, without its lines. */
export type InvoiceHeader = InvoiceHeading & { id: string; invoiceNumber: number; status: InvoiceStatus };

/** One line of an invoice as kept, with what it comes to: quantity times unit price, to the penny. */
export type InvoiceLine = InvoiceLineInput & { id: string; amount: number };

export type InvoiceHeaderRow = {
	id: string;
	customer_id: string;
	invoice_number: number;
	status: InvoiceStatus;
	issue_date: string;
	due_date: string;
	reference: string;
	notes: string;
};

export type InvoiceLineRow = {
	id: string;
	description: string;
	quantity: number | string;
	unit_price: number | string;
	income_account_id: string;
	cost_centre_id: string | null;
};

export const invoicesTable = 'books_invoices';

export const invoiceLinesTable = 'books_invoice_lines';

export const invoiceHeaderColumns = 'id, customer_id, invoice_number, status, issue_date, due_date, reference, notes';

export const invoiceLineColumns = 'id, description, quantity, unit_price, income_account_id, cost_centre_id';

/** Each heading's column in books_invoices (migration 0151), stated once for reading and writing. */
const invoiceHeadingColumns: Record<keyof InvoiceHeading, string> = {
	customerId: 'customer_id',
	issueDate: 'issue_date',
	dueDate: 'due_date',
	reference: 'reference',
	notes: 'notes'
};

/** The columns of the headings given, and none of the ones left out. */
export function toInvoiceHeadingColumns(heading: Partial<InvoiceHeading>): Record<string, unknown> {
	const given = Object.entries(heading).filter(([name, value]) => name in invoiceHeadingColumns && value !== undefined);
	return Object.fromEntries(given.map(([name, value]) => [invoiceHeadingColumns[name as keyof InvoiceHeading], value]));
}

export function fromInvoiceHeaderRow(row: InvoiceHeaderRow): InvoiceHeader {
	return {
		id: row.id,
		customerId: row.customer_id,
		invoiceNumber: row.invoice_number,
		status: row.status,
		issueDate: row.issue_date,
		dueDate: row.due_date,
		reference: row.reference,
		notes: row.notes
	};
}

export function fromInvoiceLineRow(row: InvoiceLineRow): InvoiceLine {
	const quantity = Number(row.quantity);
	const unitPrice = Number(row.unit_price);
	return {
		id: row.id,
		description: row.description,
		quantity,
		unitPrice,
		amount: invoiceLineTotal(quantity, unitPrice),
		incomeAccountId: row.income_account_id,
		costCentreId: row.cost_centre_id
	};
}

/** The columns books_invoice_lines keeps for a line, in its place on the invoice. */
export function toInvoiceLineRow(organisationId: string, invoiceId: string, line: InvoiceLineInput, position: number) {
	return {
		organisation_id: organisationId,
		invoice_id: invoiceId,
		description: line.description,
		quantity: line.quantity,
		unit_price: line.unitPrice,
		income_account_id: line.incomeAccountId,
		cost_centre_id: line.costCentreId,
		position
	};
}
