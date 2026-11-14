import { isoDateDaysFrom } from '$lib/data/demo/demoDates';
import { BillingCovers, monthsInBillingPeriod, type BillingCover, type BillingFrequency } from './billingSchedule';
import { describeMonth, monthEnd, monthOfDay, shiftMonth } from './monthKey';
import { monthName } from './monthName';

/** The days one invoice of a schedule covers, its first and its last, written as 2026-12-01. */
export type BillingPeriod = { start: string; end: string };

/** How a schedule bills: how often, and whether each invoice covers the period ahead of its date or behind it. */
export type BillingRhythm = { frequency: BillingFrequency; covers: BillingCover };

const dayBefore = -1;
const firstOfTheMonth = '01';

/** The day that many months on from a day of the month no later than the 28th, or back when the count is below zero. */
export function shiftDayOfMonth(isoDate: string, monthsToAdd: number): string {
	const dayOfMonth = isoDate.slice(-2);
	return `${shiftMonth(monthOfDay(isoDate), monthsToAdd)}-${dayOfMonth}`;
}

/** The date of the invoice after one raised on the day given: one period on from that day. */
export function invoiceDateAfter(invoiceDate: string, frequency: BillingFrequency): string {
	return shiftDayOfMonth(invoiceDate, monthsInBillingPeriod[frequency]);
}

/** The period an invoice raised on the day given covers: the one starting that day, or the one ending the day before. */
export function periodOfInvoice(invoiceDate: string, rhythm: BillingRhythm): BillingPeriod {
	const months = monthsInBillingPeriod[rhythm.frequency];
	if (rhythm.covers === BillingCovers.inArrears) {
		return { start: shiftDayOfMonth(invoiceDate, -months), end: isoDateDaysFrom(invoiceDate, dayBefore) };
	}
	return { start: invoiceDate, end: isoDateDaysFrom(shiftDayOfMonth(invoiceDate, months), dayBefore) };
}

/** A period in words, the same everywhere: one whole calendar month as "December 2026", any other by its first and last day. */
export function describeBillingPeriod(period: BillingPeriod): string {
	const month = monthOfDay(period.start);
	const isWholeCalendarMonth = period.start.endsWith(`-${firstOfTheMonth}`) && period.end === monthEnd(month);
	if (isWholeCalendarMonth) return describeMonth(month);
	return `${describeDayInFull(period.start)} to ${describeDayInFull(period.end)}`;
}

/** A day as a person writes it in full: 15 December 2026. */
function describeDayInFull(isoDate: string): string {
	const [year, month, day] = isoDate.split('-').map(Number);
	return `${day} ${monthName(month)} ${year}`;
}
