import type { SupabaseClient } from '@supabase/supabase-js';
import { describeBillingPeriod, periodOfInvoice, type BillingPeriod } from '$lib/data/books/billingPeriods';
import { BillingRunMoves, type BillingRunEvent } from '$lib/data/books/billingRunReport';
import { nextScheduledInvoice } from '$lib/data/books/billingScheduleStanding';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { isScheduleDue, scheduledInvoiceOf } from '$lib/data/books/scheduledInvoice';
import { customerNameIn, printedNumberIn, type BooksForRun } from './billingRunBooks';
import { eventsOrFailure, issueAndSend, type BillingRunRequest } from './billingRunDelivery';
import type { BillingSchedule } from './billingScheduleRecord';
import { findInvoiceHeader } from './invoices';
import { raiseScheduledInvoice } from './raiseScheduledInvoice';

/** Raises one invoice from each schedule whose day has come, and issues and sends it when the schedule sends by itself. */
export async function raiseDueInvoices(supabase: SupabaseClient, request: BillingRunRequest, books: BooksForRun): Promise<BillingRunEvent[]> {
	const due = books.schedules.filter((schedule) => isScheduleDue(schedule, request.today));
	const events: BillingRunEvent[] = [];
	for (const schedule of due) {
		const subject = `${schedule.title} for ${customerNameIn(books, schedule.customerId)}`;
		events.push(...(await eventsOrFailure(subject, () => raiseFromSchedule(supabase, request, books, schedule))));
	}
	return events;
}

/** Why nothing is raised from the schedule today, or null when its invoice may be raised. */
function skippingReason(books: BooksForRun, schedule: BillingSchedule): string | null {
	const customer = books.customers.get(schedule.customerId);
	if (customer === undefined || customer.isArchived) return 'its customer is archived';
	if (customer.email === '') return 'its customer has no email in the books; set one with update_customer';
	const period = periodOfInvoice(schedule.nextInvoiceDate, schedule);
	const isInvoiced = books.scheduledInvoices.some((invoice) => invoice.scheduleId === schedule.id && isSameStart(invoice.period, period));
	if (isInvoiced) return `${describeBillingPeriod(period)} is already invoiced; move its next invoice date on with update_billing_schedule`;
	return null;
}

function isSameStart(first: BillingPeriod, second: BillingPeriod): boolean {
	return first.start === second.start;
}

async function raiseFromSchedule(supabase: SupabaseClient, request: BillingRunRequest, books: BooksForRun, schedule: BillingSchedule): Promise<BillingRunEvent[]> {
	const subject = `${schedule.title} for ${customerNameIn(books, schedule.customerId)}`;
	const reason = skippingReason(books, schedule);
	if (reason !== null) return [{ move: BillingRunMoves.skipped, sentence: `Nothing was raised from ${subject}: ${reason}.` }];
	const invoice = scheduledInvoiceOf(schedule, request.today, books.paymentTermsDays);
	const isRaised = await raiseScheduledInvoice(supabase, request.organisationId, schedule, invoice);
	if (!isRaised) return [{ move: BillingRunMoves.skipped, sentence: `${subject} changed while it was being raised, so the next run raises it as it then stands.` }];
	const header = await findInvoiceHeader(supabase, request.organisationId, invoice.id);
	const raisedInvoice = { id: invoice.id, printedNumber: printedNumberIn(books, Number(header?.invoiceNumber)) };
	const total = formatPoundsAndPence(nextScheduledInvoice(schedule).total);
	const raised = `Raised ${raisedInvoice.printedNumber} to ${customerNameIn(books, schedule.customerId)}, ${total}, for ${invoice.reference}`;
	if (!schedule.sendsByItself) return [{ move: BillingRunMoves.raised, sentence: `${raised}, left as a draft to issue by hand.` }];
	const delivered = await eventsOrFailure(raisedInvoice.printedNumber, () => issueAndSend(supabase, request, raisedInvoice));
	return [{ move: BillingRunMoves.raised, sentence: `${raised}.` }, ...delivered];
}
