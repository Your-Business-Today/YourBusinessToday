import type { InvoiceRow } from '$lib/data/books/page/invoiceRows';
import { daysOverdueOn, owedOn } from '$lib/data/books/page/invoiceStanding';
import { customerNameOf, invoiceNumberAsPrinted, type InvoiceNamings } from './invoiceNamings';
import type { InvoiceSummary } from './invoices';

/** What an invoice row is read against: how the books name things, when each invoice was last emailed, and today's date. */
export type InvoiceRowContext = { namings: InvoiceNamings; lastSentTimes: Map<string, string>; today: string };

/** One invoice as the Invoices page lists it. */
export function invoiceRowOf(invoice: InvoiceSummary, context: InvoiceRowContext): InvoiceRow {
	return {
		id: invoice.id,
		number: invoiceNumberAsPrinted(context.namings, invoice.invoiceNumber),
		invoiceNumber: invoice.invoiceNumber,
		customer: customerNameOf(context.namings, invoice.customerId),
		dated: invoice.issueDate,
		due: invoice.dueDate,
		total: invoice.total,
		owed: owedOn(invoice),
		status: invoice.status,
		daysOverdue: daysOverdueOn(invoice, context.today),
		sentAt: context.lastSentTimes.get(invoice.id) ?? null
	};
}
