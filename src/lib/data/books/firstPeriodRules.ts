import { validateIsoDate } from './isoDate';
import { monthEnd, monthOfDay, shiftMonth } from './monthKey';
import { monthName } from './monthName';
import { isDayBeforeYearStart, type FirstAccountingPeriod } from './financialYear';

/** The longest a first accounting period may run, in months. */
export const longestFirstPeriodMonths = 18;

const FirstPeriodFields = { start: 'firstPeriodStart', end: 'firstPeriodEnd' } as const;
const dayOfMonthLength = 2;
const Months = { january: 1, december: 12 } as const;

/** Why a first period column cannot hold the value: a real day, or null to clear it. */
export function firstPeriodDayRefusal(fieldName: string, value: unknown): string | null {
	if (value === null) return null;
	return validateIsoDate(fieldName, value);
}

/** Why the first period's two days, as given, are not a pair: given together, and cleared together. */
export function firstPeriodPairRefusal(start: unknown, end: unknown): string | null {
	const isStartGiven = start !== undefined;
	const isEndGiven = end !== undefined;
	if (isStartGiven !== isEndGiven) return `${FirstPeriodFields.start} and ${FirstPeriodFields.end} are given together, or both left out.`;
	const isStartCleared = start === null;
	const isEndCleared = end === null;
	if (isStartCleared !== isEndCleared) return `${FirstPeriodFields.start} and ${FirstPeriodFields.end} are cleared together, both as null.`;
	return null;
}

/** Why the first period cannot run so beside a financial year starting in the month (1 to 12), or null. */
export function firstPeriodRefusal(period: FirstAccountingPeriod, startMonth: number): string | null {
	const { start, end } = period;
	if (end < start) return `${FirstPeriodFields.end} (${end}) is before ${FirstPeriodFields.start} (${start}).`;
	const firstDayTooLong = sameDayMonthsOn(start, longestFirstPeriodMonths);
	if (end >= firstDayTooLong) return `A first period runs at most ${longestFirstPeriodMonths} months; ${start} to ${end} is longer.`;
	if (isDayBeforeYearStart(end, startMonth)) return null;
	const yearEndMonth = monthBefore(startMonth);
	return (
		`${FirstPeriodFields.end} is the day before a financial year starts: the last day of ${monthName(yearEndMonth)}, ` +
		`as the year starts in ${monthName(startMonth)}; ${end} was given.`
	);
}

function sameDayMonthsOn(isoDate: string, months: number): string {
	const month = shiftMonth(monthOfDay(isoDate), months);
	const lastDay = monthEnd(month);
	const sameDay = `${month}-${isoDate.slice(-dayOfMonthLength)}`;
	if (sameDay < lastDay) return sameDay;
	return lastDay;
}

function monthBefore(month: number): number {
	if (month === Months.january) return Months.december;
	return month - 1;
}
