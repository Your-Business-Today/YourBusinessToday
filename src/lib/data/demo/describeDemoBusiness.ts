import type { DemoBusiness, DemoInvoice, DemoJob, DemoQuote, DemoSubscription } from './demoBusiness';
import { pounds } from './demoMoney';

export function describeBusiness(business: DemoBusiness, today: string): string {
	const clientNames = business.clients.map((client) => `${client.name} (${client.contact})`);
	return [
		`${business.name}: ${business.trade}, in ${business.town}. Today is ${today}.`,
		'',
		'People:',
		...business.people.map((person) => `- ${person.name}: ${person.role}`),
		'',
		'Clients:',
		...clientNames.map((name) => `- ${name}`),
		'',
		'Jobs:',
		...business.jobs.map((job) => jobLine(business, job)),
		'',
		'Quotes:',
		...business.quotes.map((quote) => quoteLine(business, quote)),
		'',
		'Invoices:',
		...business.invoices.map((invoice) => invoiceLine(invoice)),
		'',
		'Subscriptions:',
		...business.subscriptions.map(subscriptionLine)
	].join('\n');
}

export function describeInbox(business: DemoBusiness): string {
	const lines = business.inbox.map(
		(email) => `- ${email.id}, ${email.receivedOn}, from ${email.from}: "${email.subject}". ${email.summary}`
	);
	return ['The shared info@ inbox, newest last:', ...lines].join('\n');
}

export function describeSystems(business: DemoBusiness): string {
	const lines = business.systems.map(
		(system) => `- ${system.name} holds ${lowerFirst(system.holds)}. Claude ${lowerFirst(system.claudeReaches)}.`
	);
	return [
		`What ${business.name} runs on, and what Claude reaches through each:`,
		...lines,
		'',
		'In a real build these are your own Microsoft 365 tenant and your own Azure subscription; ' +
			'the portal is built from your folders, and Your Business Today never holds your data.'
	].join('\n');
}

export function describeBrain(business: DemoBusiness): string {
	const lines = business.brain.map((entry) => `- ${entry.id} (learned ${entry.learnedOn}): ${entry.note}`);
	return [`What ${business.name}'s brain knows about how the business works:`, ...lines].join('\n');
}

export function describeLog(business: DemoBusiness): string {
	return ['What has happened in this copy of the demo:', ...business.log.map((entry) => `- ${entry.on}: ${entry.sentence}`)].join('\n');
}

function jobLine(business: DemoBusiness, job: DemoJob): string {
	const unbilled = job.workDone - job.invoiced;
	const unbilledNote = unbilled > 0 ? `, ${pounds(unbilled)} done but not invoiced` : '';
	const who = `${job.id}, ${clientName(business, job.clientId)}: ${job.name}, ${job.status}`;
	return `- ${who}; ${pounds(job.workDone)} of work done, ${pounds(job.invoiced)} invoiced${unbilledNote}`;
}

function quoteLine(business: DemoBusiness, quote: DemoQuote): string {
	const chase = quote.chasedOn === null ? 'never followed up' : `followed up ${quote.chasedOn}`;
	return `- ${quote.id}, ${clientName(business, quote.clientId)}: ${quote.work}, ${pounds(quote.amount)}, sent ${quote.sentOn}, ${quote.status}, ${chase}`;
}

function invoiceLine(invoice: DemoInvoice): string {
	const chase = invoice.chasedOn === null ? 'not chased' : `chased ${invoice.chasedOn}`;
	return `- ${invoice.id} on ${invoice.jobId}: ${pounds(invoice.amount)}, issued ${invoice.issuedOn}, due ${invoice.dueOn}, ${invoice.status}, ${chase}`;
}

function subscriptionLine(subscription: DemoSubscription): string {
	const state = subscription.cancelledOn === null ? 'live' : `cancelled ${subscription.cancelledOn}`;
	return `- ${subscription.id}: ${subscription.name}, ${pounds(subscription.monthlyCost)} a month on ${subscription.paidBy}, ${state}`;
}

function clientName(business: DemoBusiness, clientId: string): string {
	return business.clients.find((client) => client.id === clientId)?.name ?? clientId;
}

function lowerFirst(sentence: string): string {
	return sentence.charAt(0).toLowerCase() + sentence.slice(1);
}
