import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { BillingCovers, billingFrequencyLabels, type BillingCover } from '$lib/data/books/billingSchedule';
import { nextScheduledInvoice, standingOfSchedule, type BillingScheduleStanding } from '$lib/data/books/billingScheduleStanding';
import type { BillingSchedule } from '$lib/server/books/billingScheduleRecord';
import { customerNameOf, type InvoiceNamings } from '$lib/server/books/invoiceNamings';
import { describeInvoiceLine, printedOnlyWhenGiven } from './describeInvoices';

const coversInWords: Record<BillingCover, string> = {
	[BillingCovers.inAdvance]: 'in advance',
	[BillingCovers.inArrears]: 'in arrears'
};

/** Every schedule shown, each in full, or that the books hold none that match. */
export function describeBillingSchedules(organisationName: string, schedules: BillingSchedule[], namings: InvoiceNamings): string {
	if (schedules.length === 0) return `${organisationName}'s books hold no billing schedules that match.`;
	const described = schedules.map((schedule) => describeBillingSchedule(schedule, namings));
	return [`Billing schedules in ${organisationName}'s books:`, ...described].join('\n\n');
}

/** One schedule in full: whose it is, how often and when it bills next, how it is paid and sent, and every line. */
export function describeBillingSchedule(schedule: BillingSchedule, namings: InvoiceNamings): string {
	return [
		`${schedule.title}, billing ${customerNameOf(namings, schedule.customerId)} (customer ${schedule.customerId}). Id ${schedule.id}`,
		`${billingFrequencyLabels[schedule.frequency]}, ${coversInWords[schedule.covers]}. ${describeStanding(schedule)}`,
		describePaymentTerms(schedule.paymentTermsDays),
		describeSending(schedule.sendsByItself),
		...printedOnlyWhenGiven('Last date', schedule.endsOn === null ? '' : formatBritishDate(schedule.endsOn)),
		'Lines:',
		...schedule.lines.map((line) => describeInvoiceLine(line, namings)),
		...printedOnlyWhenGiven('Notes printed on each invoice', schedule.notes)
	].join('\n');
}

const standingWords: Record<BillingScheduleStanding, (nextInvoice: string, endsOn: string) => string> = {
	running: (nextInvoice) => `Running; next invoice ${nextInvoice}.`,
	paused: (nextInvoice) => `Paused, so nothing is raised; once resumed, next invoice ${nextInvoice}.`,
	ended: (_nextInvoice, endsOn) => `Ended: nothing is raised after ${endsOn}.`
};

function describeStanding(schedule: BillingSchedule): string {
	const next = nextScheduledInvoice(schedule);
	const nextInvoice = `${formatBritishDate(next.date)}, ${formatPoundsAndPence(next.total)}, for ${next.periodInWords}`;
	const endsOn = schedule.endsOn === null ? '' : formatBritishDate(schedule.endsOn);
	return standingWords[standingOfSchedule(schedule)](nextInvoice, endsOn);
}

function describePaymentTerms(paymentTermsDays: number | null): string {
	if (paymentTermsDays === null) return "Each invoice falls due on the books' own payment terms.";
	return `Each invoice falls due ${paymentTermsDays} days after it is dated.`;
}

function describeSending(isSentByItself: boolean): string {
	if (isSentByItself) return 'Sends by itself: each invoice is issued and emailed to the customer on its day.';
	return 'Does not send by itself: each invoice is left as a draft to issue by hand.';
}
