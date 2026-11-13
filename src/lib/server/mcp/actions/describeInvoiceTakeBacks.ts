import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence } from '$lib/data/books/money';
import type { InvoicePaymentTakeBack } from '$lib/server/books/invoicePaymentTakeBacks';

/** The payments taken back off an invoice, each with the day it was recorded for and the day it was taken back, or no lines. */
export function describeTakeBacks(takeBacks: InvoicePaymentTakeBack[]): string[] {
	if (takeBacks.length === 0) return [];
	return ['Payments taken back, so not money received:', ...takeBacks.map(describeTakeBack)];
}

function describeTakeBack(takeBack: InvoicePaymentTakeBack): string {
	const recorded = `${formatBritishDate(takeBack.paidOn)}: ${formatPoundsAndPence(takeBack.amount)}`;
	const reversal = takeBack.reversalJournalId === null ? '' : ` by journal ${takeBack.reversalJournalId}`;
	return `- ${recorded}, taken back on ${formatBritishDate(takeBack.takenBackOn)}${reversal}`;
}
