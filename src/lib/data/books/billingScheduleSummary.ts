import { formatBritishDate } from '$lib/data/britishDate';
import { formatPoundsAndPence } from './money';
import { monthName } from './monthName';
import { BillingCovers, BillingFrequencies, type BillingCover, type BillingFrequency, type BillingScheduleSettings } from './billingSchedule';
import { nextScheduledInvoice, standingOfSchedule, type BillingScheduleStanding } from './billingScheduleStanding';
import type { InvoiceLineInput } from './invoiceLineRules';

/** A schedule as its summary reads it: its settings and its lines. */
export type ScheduleToSummarise = BillingScheduleSettings & { lines: InvoiceLineInput[] };

const coversInWords: Record<BillingCover, string> = { [BillingCovers.inAdvance]: 'in advance', [BillingCovers.inArrears]: 'in arrears' };

const ordinalEndings: Record<string, string> = { one: 'st', two: 'nd', few: 'rd', other: 'th' };

const ordinalRules = new Intl.PluralRules('en-GB', { type: 'ordinal' });

const dayOfMonthStart = 8;

const monthDigits = { start: 5, end: 7 } as const;

/**
 * The schedule in one line that reads at a glance: "£5,100.00 every month on the 1st, in advance. 14 days to pay.
 * Sends by itself. Next invoice 1 Dec 2026." The books' own days to pay stand in when the schedule names none.
 */
export function summariseBillingSchedule(schedule: ScheduleToSummarise, booksPaymentTermsDays: number): string {
	const next = nextScheduledInvoice(schedule);
	const rhythm = `${formatPoundsAndPence(next.total)} ${rhythmInWords(schedule.frequency, schedule.nextInvoiceDate)}, ${coversInWords[schedule.covers]}.`;
	const terms = daysToPayInWords(schedule.paymentTermsDays ?? booksPaymentTermsDays);
	const sending = schedule.sendsByItself ? 'Sends by itself.' : 'Each invoice waits as a draft to issue by hand.';
	return [rhythm, terms, sending, standingInWords(schedule)].join(' ');
}

function rhythmInWords(frequency: BillingFrequency, nextInvoiceDate: string): string {
	const dayOfMonth = Number(nextInvoiceDate.slice(dayOfMonthStart));
	const onTheDay = `on the ${dayOfMonth}${ordinalEndings[ordinalRules.select(dayOfMonth)]}`;
	if (frequency === BillingFrequencies.monthly) return `every month ${onTheDay}`;
	if (frequency === BillingFrequencies.quarterly) return `every quarter ${onTheDay}`;
	const month = monthName(Number(nextInvoiceDate.slice(monthDigits.start, monthDigits.end)));
	return `every year on ${dayOfMonth} ${month}`;
}

const oneDay = 1;

function daysToPayInWords(days: number): string {
	if (days === oneDay) return `${oneDay} day to pay.`;
	return `${days} days to pay.`;
}

const standingWords: Record<BillingScheduleStanding, (nextInvoice: string, endsOn: string) => string> = {
	running: (nextInvoice) => `Next invoice ${nextInvoice}.`,
	paused: (nextInvoice) => `Paused: nothing is raised until it is resumed, then next invoice ${nextInvoice}.`,
	ended: (_nextInvoice, endsOn) => `Ended: nothing is raised after ${endsOn}.`
};

function standingInWords(schedule: ScheduleToSummarise): string {
	const nextInvoice = formatBritishDate(schedule.nextInvoiceDate);
	const endsOn = schedule.endsOn === null ? '' : formatBritishDate(schedule.endsOn);
	return standingWords[standingOfSchedule(schedule)](nextInvoice, endsOn);
}
