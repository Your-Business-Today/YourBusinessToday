import { differenceOf, formatPoundsAndPence, sumMoney } from '$lib/data/books/money';
import { describeMonth } from '$lib/data/books/monthKey';
import type { ProfitAndLossTotals } from '$lib/data/books/reports/profitAndLoss';
import type { BooksOverview } from '$lib/server/books/booksOverview';
import type { InvoiceSummary } from '$lib/server/books/invoices';
import type { InvoiceNamings } from '$lib/server/books/invoiceNamings';
import { describeInvoiceSummary } from './describeInvoices';

/** The front page of an organisation's books: where the money stands, how the month went, and who still owes. */
export function describeBooksOverview(organisationName: string, overview: BooksOverview, namings: InvoiceNamings): string {
	const standing = overview.standing;
	const month = describeMonth(standing.monthKey);
	return [
		`How ${organisationName}'s books stand at the end of ${month}:`,
		`- Bank: ${formatPoundsAndPence(standing.bank)}`,
		`- Owed by customers: ${formatPoundsAndPence(standing.debtors)}`,
		`- Owed to suppliers: ${formatPoundsAndPence(standing.creditors)}`,
		'',
		`${month}, with the financial year to date:`,
		`- Income: ${totalsText(standing.income)}`,
		`- Costs: ${totalsText(standing.costs)}`,
		`- Net profit: ${totalsText(standing.netProfit)}`,
		'',
		...describeUnpaidInvoices(overview.unpaidInvoices, namings)
	].join('\n');
}

function totalsText(totals: ProfitAndLossTotals): string {
	return `${formatPoundsAndPence(totals.period)} in the month, ${formatPoundsAndPence(totals.yearToDate)} year to date`;
}

function describeUnpaidInvoices(invoices: InvoiceSummary[], namings: InvoiceNamings): string[] {
	if (invoices.length === 0) return ['No issued invoice is unpaid today.'];
	const owed = sumMoney(invoices.map((invoice) => differenceOf(invoice.total, invoice.amountPaid)));
	const heading = `Invoices unpaid today: ${invoices.length}, owing ${formatPoundsAndPence(owed)} in all, newest first:`;
	return [heading, ...invoices.map((invoice) => describeInvoiceSummary(invoice, namings))];
}
