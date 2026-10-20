import { DemoInvoiceStatus, DemoQuoteStatus, type DemoBusiness, type DemoInvoice } from './demoBusiness';
import { DemoLimit } from './demoLimits';
import { isoDateDaysFrom } from './demoDates';
import { pounds } from './demoMoney';

export type DemoChange = { business: DemoBusiness; sentence: string };

const paymentTermsDays = 30;

export function raiseInvoice(business: DemoBusiness, jobId: string, today: string): DemoChange | string {
	const job = business.jobs.find((candidate) => candidate.id === jobId);
	if (job === undefined) return `There is no job ${jobId}. read_business lists the jobs and their ids.`;
	const unbilled = job.workDone - job.invoiced;
	if (unbilled <= 0) return `${job.id} has nothing unbilled: all ${pounds(job.workDone)} of its work is invoiced.`;
	const invoice: DemoInvoice = {
		id: nextInvoiceId(business),
		clientId: job.clientId,
		jobId: job.id,
		amount: unbilled,
		issuedOn: today,
		dueOn: isoDateDaysFrom(today, paymentTermsDays),
		status: DemoInvoiceStatus.unpaid,
		chasedOn: null
	};
	const jobs = business.jobs.map((candidate) => (candidate.id === job.id ? { ...job, invoiced: job.workDone } : candidate));
	const sentence = `Raised ${invoice.id} for ${pounds(unbilled)} on ${job.name}, due ${invoice.dueOn}.`;
	return logged({ ...business, jobs, invoices: [...business.invoices, invoice] }, sentence, today);
}

export function chaseInvoice(business: DemoBusiness, invoiceId: string, today: string): DemoChange | string {
	const invoice = business.invoices.find((candidate) => candidate.id === invoiceId);
	if (invoice === undefined) return `There is no invoice ${invoiceId}. read_business lists the invoices and their ids.`;
	if (invoice.status === DemoInvoiceStatus.paid) return `${invoice.id} was paid; there is nothing to chase.`;
	const client = business.clients.find((candidate) => candidate.id === invoice.clientId);
	const invoices = business.invoices.map((candidate) =>
		candidate.id === invoice.id ? { ...invoice, chasedOn: today } : candidate
	);
	const sentence = `Chased ${invoice.id} for ${pounds(invoice.amount)} with ${client?.contact ?? 'the client'}; a reminder went from the shared mailbox.`;
	return logged({ ...business, invoices }, sentence, today);
}

export function chaseQuote(business: DemoBusiness, quoteId: string, today: string): DemoChange | string {
	const quote = business.quotes.find((candidate) => candidate.id === quoteId);
	if (quote === undefined) return `There is no quote ${quoteId}. read_business lists the quotes and their ids.`;
	if (quote.status !== DemoQuoteStatus.sent) return `${quote.id} was ${quote.status}; there is nothing to chase.`;
	const client = business.clients.find((candidate) => candidate.id === quote.clientId);
	const quotes = business.quotes.map((candidate) => (candidate.id === quote.id ? { ...quote, chasedOn: today } : candidate));
	const sentence = `Followed up ${quote.id} (${quote.work}, ${pounds(quote.amount)}) with ${client?.contact ?? 'the client'}.`;
	return logged({ ...business, quotes }, sentence, today);
}

export function cancelSubscription(business: DemoBusiness, subscriptionId: string, today: string): DemoChange | string {
	const subscription = business.subscriptions.find((candidate) => candidate.id === subscriptionId);
	if (subscription === undefined) return `There is no subscription ${subscriptionId}. read_business lists them with their ids.`;
	if (subscription.cancelledOn !== null) return `${subscription.id} was already cancelled on ${subscription.cancelledOn}.`;
	const subscriptions = business.subscriptions.map((candidate) =>
		candidate.id === subscription.id ? { ...subscription, cancelledOn: today } : candidate
	);
	const sentence = `Cancelled ${subscription.name} on ${subscription.paidBy} (${subscription.id}), saving ${pounds(subscription.monthlyCost)} a month.`;
	return logged({ ...business, subscriptions }, sentence, today);
}

export function remember(business: DemoBusiness, note: string, today: string): DemoChange | string {
	const trimmed = note.trim();
	if (trimmed === '') return 'The note is empty; say what the business should remember.';
	if (trimmed.length > DemoLimit.noteLength) {
		return `The note is ${trimmed.length} characters; the brain keeps notes of up to ${DemoLimit.noteLength}.`;
	}
	const { brain: known } = business;
	const learned = { id: noteIdFor(known.length + 1), note: trimmed, learnedOn: today };
	const brain = [...known, learned].slice(-DemoLimit.notesKept);
	return logged({ ...business, brain }, `Remembered: ${trimmed}`, today);
}

function logged(business: DemoBusiness, sentence: string, today: string): DemoChange {
	const log = [...business.log, { on: today, sentence }].slice(-DemoLimit.logEntriesKept);
	return { business: { ...business, log }, sentence };
}

function noteIdFor(noteNumber: number): string {
	const twoDigits = 2;
	return `NOTE-${String(noteNumber).padStart(twoDigits, '0')}`;
}

function nextInvoiceId(business: DemoBusiness): string {
	const highest = Math.max(...business.invoices.map((invoice) => Number(invoice.id.split('-')[1])));
	return `INV-${highest + 1}`;
}
