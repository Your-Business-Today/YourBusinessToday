import { DemoInvoiceStatus, DemoQuoteStatus, type DemoBusiness, type DemoSubscription } from './demoBusiness';
import { daysBetween } from './demoDates';

export type MoneyFinding = {
	title: string;
	figure: number;
	sentence: string;
	fixWith: string;
};

export const MoneyRule = {
	quoteQuietAfterDays: 14,
	monthsPerYear: 12
} as const;

export function findMoneyAndOpportunity(business: DemoBusiness, today: string): MoneyFinding[] {
	return [
		unbilledWork(business),
		overdueInvoices(business, today),
		quotesNeverChased(business, today),
		subscriptionsPaidTwice(business)
	].filter((finding) => finding.figure > 0);
}

function unbilledWork(business: DemoBusiness): MoneyFinding {
	const unbilledJobs = business.jobs.filter((job) => job.workDone > job.invoiced);
	const figure = unbilledJobs.reduce((sum, job) => sum + job.workDone - job.invoiced, 0);
	const jobNames = unbilledJobs.map((job) => `${job.name} (${job.id})`).join('; ');
	return {
		title: 'Work done but not yet invoiced',
		figure,
		sentence: `${unbilledJobs.length} jobs have work signed off that no invoice covers yet: ${jobNames}.`,
		fixWith: 'raise_invoice'
	};
}

function overdueInvoices(business: DemoBusiness, today: string): MoneyFinding {
	const overdue = business.invoices.filter(
		(invoice) => invoice.status === DemoInvoiceStatus.unpaid && daysBetween(invoice.dueOn, today) > 0
	);
	const figure = overdue.reduce((sum, invoice) => sum + invoice.amount, 0);
	const lines = overdue.map((invoice) => `${invoice.id}, ${daysBetween(invoice.dueOn, today)} days late`);
	return {
		title: 'Invoices past their due date',
		figure,
		sentence: `${overdue.length} invoices are overdue and none has been chased: ${lines.join('; ')}.`,
		fixWith: 'chase_invoice'
	};
}

function quotesNeverChased(business: DemoBusiness, today: string): MoneyFinding {
	const quiet = business.quotes.filter(
		(quote) =>
			quote.status === DemoQuoteStatus.sent &&
			quote.chasedOn === null &&
			daysBetween(quote.sentOn, today) > MoneyRule.quoteQuietAfterDays
	);
	const figure = quiet.reduce((sum, quote) => sum + quote.amount, 0);
	const lines = quiet.map((quote) => `${quote.id} sent ${daysBetween(quote.sentOn, today)} days ago`);
	return {
		title: 'Quotes sent and never followed up',
		figure,
		sentence: `${quiet.length} quotes have waited more than ${MoneyRule.quoteQuietAfterDays} days with no follow-up: ${lines.join('; ')}.`,
		fixWith: 'chase_quote'
	};
}

function subscriptionsPaidTwice(business: DemoBusiness): MoneyFinding {
	const live = business.subscriptions.filter((subscription) => subscription.cancelledOn === null);
	const duplicates = live.filter((subscription, index) => isRepeatOf(live, subscription, index));
	const figure = duplicates.reduce(
		(sum, subscription) => sum + subscription.monthlyCost * MoneyRule.monthsPerYear,
		0
	);
	const names = duplicates.map((subscription) => `${subscription.name} on ${subscription.paidBy} (${subscription.id})`);
	return {
		title: 'Subscriptions paid twice, per year',
		figure: Math.round(figure),
		sentence: `${duplicates.length} subscriptions are paid on two cards for the same thing: ${names.join('; ')}.`,
		fixWith: 'cancel_subscription'
	};
}

function isRepeatOf(live: DemoSubscription[], subscription: DemoSubscription, index: number): boolean {
	const firstWithName = live.findIndex((candidate) => candidate.name === subscription.name);
	return firstWithName < index;
}
