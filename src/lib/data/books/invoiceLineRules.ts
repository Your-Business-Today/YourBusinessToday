import { validateRecordId } from '$lib/data/isUuid';
import { invoiceLineTotal } from './customerBalance';
import { formatPoundsAndPence, sumMoney } from './money';
import { validateQuantity, validateSignedMoney } from './moneyColumn';

/**
 * One line of an invoice: what was sold, how many at what price, the income account the sale posts to, perhaps within a
 * cost centre. A price below zero is a line that takes money off, such as an agreed discount.
 */
export type InvoiceLineInput = {
	description: string;
	quantity: number;
	unitPrice: number;
	incomeAccountId: string;
	costCentreId: string | null;
};

type InvoiceLineFields = Record<string, unknown>;

const nothing = 0;

/** The lines as given, in their order, or the first reason one cannot be kept, naming the line and the field. */
export function validateInvoiceLines(candidate: unknown): InvoiceLineInput[] | string {
	const isListOfLines = Array.isArray(candidate) && candidate.length > 0;
	if (!isListOfLines) return 'lines is a list of at least one invoice line.';
	const lines = candidate.map((line: unknown, index) => validateInvoiceLine(line, index + 1));
	const refusal = lines.find((line): line is string => typeof line === 'string');
	if (refusal !== undefined) return refusal;
	return linesTotalRefusal(lines as InvoiceLineInput[]) ?? (lines as InvoiceLineInput[]);
}

/** Why lines that take money off take off more than the rest add up to, or null when they come to nothing or more. */
function linesTotalRefusal(lines: InvoiceLineInput[]): string | null {
	const total = sumMoney(lines.map((line) => invoiceLineTotal(line.quantity, line.unitPrice)));
	if (total >= nothing) return null;
	return `The lines come to ${formatPoundsAndPence(total)}; an invoice comes to nothing or more, so what its lines take off is no more than the rest add up to.`;
}

function validateInvoiceLine(candidate: unknown, lineNumber: number): InvoiceLineInput | string {
	const name = `Line ${lineNumber}`;
	const isObject = typeof candidate === 'object' && candidate !== null && !Array.isArray(candidate);
	if (!isObject) return `${name} has a description, quantity, unitPrice and incomeAccountId.`;
	const fields = candidate as InvoiceLineFields;
	const refusal = descriptionRefusal(name, fields.description) ?? lineIdRefusal(name, fields);
	if (refusal !== null) return refusal;
	const quantity = validateQuantity(`${name} quantity`, fields.quantity);
	if (typeof quantity === 'string') return quantity;
	const unitPrice = validateSignedMoney(`${name} unitPrice`, fields.unitPrice);
	if (typeof unitPrice === 'string') return unitPrice;
	const costCentreId = (fields.costCentreId ?? null) as string | null;
	return { description: fields.description as string, quantity, unitPrice, incomeAccountId: fields.incomeAccountId as string, costCentreId };
}

function descriptionRefusal(name: string, description: unknown): string | null {
	const isDescribed = typeof description === 'string' && description.trim() !== '';
	if (isDescribed) return null;
	return `${name} description says what the line is for, in the words the person gave.`;
}

function lineIdRefusal(name: string, fields: InvoiceLineFields): string | null {
	const accountRefusal = validateRecordId(`${name} income account`, String(fields.incomeAccountId ?? ''));
	if (accountRefusal !== null) return accountRefusal;
	const hasCostCentre = fields.costCentreId !== undefined && fields.costCentreId !== null;
	if (!hasCostCentre) return null;
	return validateRecordId(`${name} cost centre`, String(fields.costCentreId));
}
