import { differenceOf, formatPoundsAndPence } from './money';
import { validateMoney } from './moneyColumn';
import { validateIsoDate } from './isoDate';
import { InvoiceStatuses, type InvoiceStatus } from './invoiceStatuses';

/** What a move asks of an invoice: its number as printed, where it stands, its total and what has been paid on it. */
export type InvoiceForMove = { printedNumber: string; status: InvoiceStatus; total: number; amountPaid: number; paymentCount: number };

/** Money received against an invoice, as books_invoice_payments holds it. */
export type InvoicePaymentInput = { paidOn: string; amount: number };

const nothing = 0;

/** Why the invoice cannot be issued, or null when it is a draft that comes to more than nothing. */
export function issueRefusal(invoice: InvoiceForMove): string | null {
	if (invoice.status !== InvoiceStatuses.draft) return `Invoice ${invoice.printedNumber} is ${invoice.status}, and only a draft is issued.`;
	if (invoice.total > nothing) return null;
	return `Invoice ${invoice.printedNumber} comes to ${formatPoundsAndPence(invoice.total)}; an invoice is issued only when it comes to more than nothing.`;
}

/** The payment as given, or why its columns cannot hold it: the day the money arrived, and an amount above nothing. */
export function validatePayment(fields: Record<string, unknown>): InvoicePaymentInput | string {
	const dateRefusal = validateIsoDate('paidOn', fields.paidOn);
	if (dateRefusal !== null) return dateRefusal;
	const amount = validateMoney('amount', fields.amount);
	if (typeof amount === 'string') return amount;
	if (amount === nothing) return `amount is above zero; ${fields.amount} was given.`;
	return { paidOn: fields.paidOn as string, amount };
}

/** Why the money cannot be recorded against the invoice, or null when it is issued and owes at least that much. */
export function paymentRefusal(invoice: InvoiceForMove, amount: number): string | null {
	if (invoice.status !== InvoiceStatuses.issued) {
		return `Invoice ${invoice.printedNumber} is ${invoice.status}; money is recorded only against an issued invoice.`;
	}
	const owed = differenceOf(invoice.total, invoice.amountPaid);
	if (amount <= owed) return null;
	return `Invoice ${invoice.printedNumber} owes ${formatPoundsAndPence(owed)}, and ${formatPoundsAndPence(amount)} is more than that.`;
}

/** Why the invoice cannot be voided, or null when it is a draft or an issued invoice nobody has paid anything on. */
export function voidRefusal(invoice: InvoiceForMove): string | null {
	if (invoice.status === InvoiceStatuses.void) return `Invoice ${invoice.printedNumber} is already void.`;
	if (invoice.paymentCount === nothing) return null;
	return `Invoice ${invoice.printedNumber} has payments recorded against it, so it is not voided.`;
}

/** Why the invoice cannot be deleted, or null when it is a draft or void and has no payments recorded against it. */
export function deleteRefusal(invoice: InvoiceForMove): string | null {
	const isPosted = invoice.status === InvoiceStatuses.issued || invoice.status === InvoiceStatuses.paid;
	if (isPosted) return `Invoice ${invoice.printedNumber} is ${invoice.status} and posted to the ledger, so it is voided rather than deleted.`;
	if (invoice.paymentCount === nothing) return null;
	return `Invoice ${invoice.printedNumber} has payments recorded against it, so it is not deleted.`;
}

/** Why a payment cannot be taken back off the invoice, or null when it is issued or paid, as only those hold payments. */
export function takeBackRefusal(invoice: InvoiceForMove): string | null {
	const isPosted = invoice.status === InvoiceStatuses.issued || invoice.status === InvoiceStatuses.paid;
	if (isPosted) return null;
	return `Invoice ${invoice.printedNumber} is ${invoice.status}; a payment is taken back only off an issued or paid invoice.`;
}

/** What the invoice owes again once a payment of that amount is taken back off it. */
export function owedAfterTakeBack(invoice: InvoiceForMove, amount: number): number {
	return differenceOf(invoice.total, differenceOf(invoice.amountPaid, amount));
}
