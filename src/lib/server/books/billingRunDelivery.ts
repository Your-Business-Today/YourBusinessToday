import type { SupabaseClient } from '@supabase/supabase-js';
import { BillingRunMoves, type BillingRunEvent } from '$lib/data/books/billingRunReport';
import { sendingAttemptLimit } from '$lib/data/books/scheduledInvoice';
import { emailDeliveries, type EmailDelivery } from '$lib/data/emailDelivery';
import { issueInvoice } from './issueInvoice';
import { sendInvoice } from './sendInvoice';

/** One organisation's run: its books, the day on a UK clock, and the person who asked, or none when the hour knocked. */
export type BillingRunRequest = { organisationId: string; today: string; sentByAccountId: string | null };

/** An invoice the run moves on, as the person knows it. */
export type RunInvoice = { id: string; printedNumber: string };

const notGoneWords: Record<Exclude<EmailDelivery, 'sent'>, string> = {
	skipped: 'email is not set up here',
	failed: 'the email could not be sent'
};

/** Issues the draft with the one-step issue, then emails it to its customer. */
export async function issueAndSend(supabase: SupabaseClient, request: BillingRunRequest, invoice: RunInvoice): Promise<BillingRunEvent[]> {
	await issueInvoice(supabase, request.organisationId, invoice.id);
	const issued = { move: BillingRunMoves.issued, sentence: `Issued ${invoice.printedNumber}.` };
	return [issued, ...(await eventsOrFailure(invoice.printedNumber, () => sendScheduledInvoice(supabase, request, invoice, 0)))];
}

/** Emails the issued invoice to its customer's address in the books, and says whether it went or how many tries are left. */
export async function sendScheduledInvoice(
	supabase: SupabaseClient,
	request: BillingRunRequest,
	invoice: RunInvoice,
	triesBefore: number
): Promise<BillingRunEvent[]> {
	const sending = { organisationId: request.organisationId, invoiceId: invoice.id, to: undefined, sentByAccountId: request.sentByAccountId };
	const outcome = await sendInvoice(supabase, sending);
	if (outcome.delivery === emailDeliveries.sent) return [{ move: BillingRunMoves.sent, sentence: `Sent ${invoice.printedNumber} to ${outcome.sentTo}.` }];
	const triesLeft = sendingAttemptLimit - triesBefore - 1;
	const reason = `${invoice.printedNumber} did not go to ${outcome.sentTo}: ${notGoneWords[outcome.delivery]}`;
	return [{ move: BillingRunMoves.unsent, sentence: `${reason}; ${triesLeftWords(triesLeft)}.` }];
}

/** The invoice was emailed as many times as the run tries and never went, so it is left for a person. */
export function givenUpEvent(invoice: RunInvoice): BillingRunEvent {
	const sentence = `${invoice.printedNumber} was tried ${sendingAttemptLimit} times and never went; send it with send_invoice once its address is right.`;
	return { move: BillingRunMoves.givenUp, sentence };
}

/** The events of the work, or the one failure that stopped it, named, so one invoice never stops the rest of the run. */
export async function eventsOrFailure(subject: string, work: () => Promise<BillingRunEvent[]>): Promise<BillingRunEvent[]> {
	try {
		return await work();
	} catch (failure) {
		return [{ move: BillingRunMoves.failed, sentence: `${subject} was left as it stood: ${messageOf(failure)}` }];
	}
}

const noTriesLeft = 0;

function triesLeftWords(triesLeft: number): string {
	if (triesLeft <= noTriesLeft) return 'it is not tried again';
	return `it is tried again on the next run (tries left: ${triesLeft})`;
}

function messageOf(failure: unknown): string {
	const message = (failure as { message?: unknown } | null)?.message;
	return String(message ?? failure);
}
