import { paymentsOnAccountRules } from './sharedRules';
import { formatLongDate, localDateFrom } from './taxDates';
import type { QuarterlyUpdate, TaxYearRules } from './taxRuleTypes';

export type TaxDeadline = {
	dueOn: string;
	title: string;
	detail: string;
	sourceUrl: string;
};

export function taxDeadlinesFor(rules: TaxYearRules): TaxDeadline[] {
	const deadlines = [...filingDeadlinesFor(rules), ...paymentDeadlinesFor(rules), ...quarterlyDeadlinesFor(rules)];
	return deadlines.sort((earlier, later) => earlier.dueOn.localeCompare(later.dueOn));
}

export function deadlinesStillAhead(deadlines: TaxDeadline[], today: Date): TaxDeadline[] {
	const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
	return deadlines.filter((deadline) => localDateFrom(deadline.dueOn) >= startOfToday);
}

function filingDeadlinesFor(rules: TaxYearRules): TaxDeadline[] {
	const { registerBy, paperReturnBy, onlineReturnToPayThroughTaxCodeBy, sourceUrl } = rules.filingDeadlines;
	return [
		{
			dueOn: registerBy,
			title: 'Register for Self Assessment',
			detail: `If you need to send a tax return for ${rules.taxYear} and have not registered, tell HMRC by this date.`,
			sourceUrl
		},
		{
			dueOn: paperReturnBy,
			title: 'Paper tax return due',
			detail: `HMRC must receive a paper return for ${rules.taxYear} by 11:59pm.`,
			sourceUrl
		},
		{
			dueOn: onlineReturnToPayThroughTaxCodeBy,
			title: 'Online return, to pay through your tax code',
			detail: `Send your ${rules.taxYear} return online by 11:59pm if you want what you owe collected through your PAYE tax code.`,
			sourceUrl
		}
	];
}

function paymentDeadlinesFor(rules: TaxYearRules): TaxDeadline[] {
	const { filingDeadlines } = rules;
	return [
		{
			dueOn: rules.balancingPaymentDueOn,
			title: 'Online tax return and payment due',
			detail: `Send your ${rules.taxYear} return online and pay what you owe by 11:59pm. If you make payments on account, the first towards next year is due by the same date.`,
			sourceUrl: filingDeadlines.sourceUrl
		},
		{
			dueOn: rules.secondPaymentOnAccountDueOn,
			title: 'Second payment on account due',
			detail: 'If you make payments on account, pay the second towards next year’s bill by midnight.',
			sourceUrl: paymentsOnAccountRules.sourceUrl
		}
	];
}

function quarterlyDeadlinesFor(rules: TaxYearRules): TaxDeadline[] {
	const { updates, sourceUrl } = rules.quarterlyUpdates;
	return updates.map((update) => ({
		dueOn: update.dueOn,
		title: 'Making Tax Digital quarterly update due',
		detail: `If Making Tax Digital for Income Tax applies to you, send the update covering ${periodCoveredBy(update, rules)}.`,
		sourceUrl
	}));
}

function periodCoveredBy(update: QuarterlyUpdate, rules: TaxYearRules): string {
	return `${formatLongDate(rules.startsOn)} to ${formatLongDate(update.periodEndsOn)}`;
}
