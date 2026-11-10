import { validateRecordId } from '$lib/data/isUuid';
import { validateIsoDate } from './isoDate';
import { validateInvoiceLines, type InvoiceLineInput } from './invoiceLineRules';

/** Who an invoice is to, when it is issued and due, and the reference and notes it prints, as books_invoices holds them. */
export type InvoiceHeading = { customerId: string; issueDate: string; dueDate: string; reference: string; notes: string };

/** A new draft: its customer and lines, with the dates left out to be taken from today and the payment terms. */
export type NewInvoiceDraft = Omit<InvoiceHeading, 'issueDate' | 'dueDate'> & {
	issueDate: string | null;
	dueDate: string | null;
	lines: InvoiceLineInput[];
};

/** What a person asked to change of a draft; lines, when given, are every line the draft is to hold. */
export type InvoiceDraftChange = Partial<InvoiceHeading> & { lines?: InvoiceLineInput[] };

const headingNames = ['customerId', 'issueDate', 'dueDate', 'reference', 'notes'] as const;

const leftOut = '';

/** The draft as given, or the first reason it cannot be kept: never trimmed, rounded or filled in beyond the column defaults. */
export function validateNewInvoiceDraft(fields: Record<string, unknown>): NewInvoiceDraft | string {
	if (fields.customerId === undefined) return 'customerId is needed: it is who the invoice is made out to.';
	const refusal = givenHeadingRefusal(fields);
	if (refusal !== null) return refusal;
	const lines = validateInvoiceLines(fields.lines);
	if (typeof lines === 'string') return lines;
	return {
		customerId: fields.customerId as string,
		issueDate: (fields.issueDate ?? null) as string | null,
		dueDate: (fields.dueDate ?? null) as string | null,
		reference: (fields.reference ?? leftOut) as string,
		notes: (fields.notes ?? leftOut) as string,
		lines
	};
}

/** The change as given, or the first reason it cannot be made; everything left out keeps what the draft holds. */
export function validateInvoiceDraftChange(fields: Record<string, unknown>): InvoiceDraftChange | string {
	const givenHeadings = headingNames.filter((name) => fields[name] !== undefined);
	const isLinesGiven = fields.lines !== undefined;
	if (givenHeadings.length === 0 && !isLinesGiven) return 'No change was given. Give at least one detail or the lines, and leave out the rest to keep them.';
	const refusal = givenHeadingRefusal(fields);
	if (refusal !== null) return refusal;
	const change: InvoiceDraftChange = Object.fromEntries(givenHeadings.map((name) => [name, fields[name]]));
	if (!isLinesGiven) return change;
	const lines = validateInvoiceLines(fields.lines);
	if (typeof lines === 'string') return lines;
	return { ...change, lines };
}

/** Why an invoice cannot fall due on the day given, or null when it falls due on or after the day it is issued. */
export function dueDateRefusal(issueDate: string, dueDate: string): string | null {
	if (dueDate >= issueDate) return null;
	return `dueDate ${dueDate} is before issueDate ${issueDate}; an invoice falls due on or after the day it is issued.`;
}

function givenHeadingRefusal(fields: Record<string, unknown>): string | null {
	const refusals = [
		fields.customerId === undefined ? null : validateRecordId('customer', String(fields.customerId)),
		fields.issueDate === undefined ? null : validateIsoDate('issueDate', fields.issueDate),
		fields.dueDate === undefined ? null : validateIsoDate('dueDate', fields.dueDate),
		textRefusal('reference', fields.reference),
		textRefusal('notes', fields.notes)
	];
	return refusals.find((refusal) => refusal !== null) ?? null;
}

function textRefusal(field: string, value: unknown): string | null {
	if (value === undefined || typeof value === 'string') return null;
	return `${field} is text; ${JSON.stringify(value)} was given.`;
}
