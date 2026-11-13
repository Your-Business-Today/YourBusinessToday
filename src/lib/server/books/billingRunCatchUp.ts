import type { SupabaseClient } from '@supabase/supabase-js';
import type { BillingRunEvent } from '$lib/data/books/billingRunReport';
import { InvoiceStatuses } from '$lib/data/books/invoiceStatuses';
import { sendingAttemptLimit } from '$lib/data/books/scheduledInvoice';
import { printedNumberIn, type BooksForRun } from './billingRunBooks';
import { eventsOrFailure, givenUpEvent, issueAndSend, sendScheduledInvoice, type BillingRunRequest, type RunInvoice } from './billingRunDelivery';
import { findSendingTallies, type SendingTally } from './invoiceSendings';
import type { ScheduledInvoiceRecord } from './scheduledInvoices';

const neverTried: SendingTally = { hasGone: false, triesNotGone: 0 };

/**
 * Finishes what an earlier run was cut off from or could not do: each invoice raised from a schedule that sends by itself
 * and still a draft is issued and sent, and each one issued that has not gone is emailed again, until it has been tried
 * as many times as the run tries, after which it is named and left for a person.
 */
export async function finishCutOffInvoices(supabase: SupabaseClient, request: BillingRunRequest, books: BooksForRun): Promise<BillingRunEvent[]> {
	const selfSendingIds = new Set(books.schedules.filter((schedule) => schedule.sendsByItself).map((schedule) => schedule.id));
	const waiting = books.scheduledInvoices.filter((invoice) => selfSendingIds.has(invoice.scheduleId) && isWaiting(invoice));
	const issuedIds = waiting.filter((invoice) => invoice.status === InvoiceStatuses.issued).map((invoice) => invoice.invoiceId);
	const tallies = await findSendingTallies(supabase, request.organisationId, issuedIds);
	const events: BillingRunEvent[] = [];
	for (const record of waiting) {
		const invoice = { id: record.invoiceId, printedNumber: printedNumberIn(books, record.invoiceNumber) };
		events.push(...(await finishInvoice(supabase, request, { invoice, record, tally: tallies.get(invoice.id) ?? neverTried })));
	}
	return events;
}

function isWaiting(invoice: ScheduledInvoiceRecord): boolean {
	return invoice.status === InvoiceStatuses.draft || invoice.status === InvoiceStatuses.issued;
}

/** One invoice still waiting: as the person knows it, as the books hold it, and how its sendings stand. */
type WaitingInvoice = { invoice: RunInvoice; record: ScheduledInvoiceRecord; tally: SendingTally };

async function finishInvoice(supabase: SupabaseClient, request: BillingRunRequest, waiting: WaitingInvoice): Promise<BillingRunEvent[]> {
	const { invoice, record, tally } = waiting;
	if (record.status === InvoiceStatuses.draft) return eventsOrFailure(invoice.printedNumber, () => issueAndSend(supabase, request, invoice));
	if (tally.hasGone) return [];
	if (tally.triesNotGone >= sendingAttemptLimit) return [givenUpEvent(invoice)];
	return eventsOrFailure(invoice.printedNumber, () => sendScheduledInvoice(supabase, request, invoice, tally.triesNotGone));
}
