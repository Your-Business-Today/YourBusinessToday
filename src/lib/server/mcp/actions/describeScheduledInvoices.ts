import { describeBillingPeriod } from '$lib/data/books/billingPeriods';
import { invoiceNumberAsPrinted, type InvoiceNamings } from '$lib/server/books/invoiceNamings';
import type { ScheduledInvoiceRecord } from '$lib/server/books/scheduledInvoices';

/** Where an invoice raised from a schedule came from, in words: "from billing schedule Monthly fees, for December 2026". */
export function describeInvoiceOrigin(record: ScheduledInvoiceRecord, scheduleTitles: ReadonlyMap<string, string>): string {
	const title = scheduleTitles.get(record.scheduleId) ?? `schedule ${record.scheduleId}`;
	return `from billing schedule ${title}, for ${describeBillingPeriod(record.period)}`;
}

/** The words for each invoice raised from a schedule, by invoice id. */
export function originWordsOf(records: ScheduledInvoiceRecord[], scheduleTitles: ReadonlyMap<string, string>): Map<string, string> {
	return new Map(records.map((record) => [record.invoiceId, describeInvoiceOrigin(record, scheduleTitles)]));
}

/** The invoices a schedule has raised, oldest first, each by its number, period and status. */
export function describeRaisedInvoices(raised: ScheduledInvoiceRecord[], namings: Pick<InvoiceNamings, 'invoicePrefix'>): string {
	if (raised.length === 0) return 'No invoice has been raised from it yet.';
	const each = raised.map((record) => `${invoiceNumberAsPrinted(namings, record.invoiceNumber)} for ${describeBillingPeriod(record.period)}, ${record.status}`);
	return `Invoices raised from it: ${each.join('; ')}.`;
}
