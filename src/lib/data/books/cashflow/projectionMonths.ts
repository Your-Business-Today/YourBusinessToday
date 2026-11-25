import { forecastMonthCount } from './cashflowForecast';
import { shiftMonth, validateMonthKey, type MonthKey } from '../monthKey';

/** How far ahead a projection may be asked for: five years of months. */
export const longestProjectionMonths = 60;

/** The month a projection runs to when none is asked for: the last month of the twelve-month forecast. */
export function defaultProjectionMonth(thisMonth: MonthKey): MonthKey {
	return shiftMonth(thisMonth, forecastMonthCount - 1);
}

/**
 * The months after this one up to the month asked for, since what this month has cost is in the books once it is
 * posted, or why that month cannot be projected to.
 */
export function projectionMonthsTo(thisMonth: MonthKey, byMonth: unknown): MonthKey[] | string {
	const asked = byMonth === undefined || byMonth === null || byMonth === '' ? defaultProjectionMonth(thisMonth) : byMonth;
	const refusal = validateMonthKey('byMonth', asked);
	if (refusal !== null) return refusal;
	const months = Array.from({ length: longestProjectionMonths }, (_, offset) => shiftMonth(thisMonth, offset + 1));
	const lastIndex = months.indexOf(asked as MonthKey);
	if (lastIndex >= 0) return months.slice(0, lastIndex + 1);
	return `byMonth is a month after ${thisMonth} and at most ${longestProjectionMonths} months ahead; ${asked} was given.`;
}
