import { monthName } from './monthName';

/** A month of the books, written as 2026-11. */
export type MonthKey = string;

const monthKeyPattern = /^\d{4}-(0[1-9]|1[0-2])$/;
const isoDateLength = 10;
const monthKeyLength = 7;

/** Why the value is not a month written as 2026-11, or null when it is one. */
export function validateMonthKey(fieldName: string, candidate: unknown): string | null {
	const isMonth = typeof candidate === 'string' && monthKeyPattern.test(candidate);
	if (isMonth) return null;
	return `${fieldName} is a month written as 2026-11; ${JSON.stringify(candidate)} was given.`;
}

/** The first day of the month, written as 2026-11-01. */
export function monthStart(monthKey: MonthKey): string {
	return `${monthKey}-01`;
}

/** The last day of the month, written as 2026-11-30. */
export function monthEnd(monthKey: MonthKey): string {
	const [year, month] = splitMonthKey(monthKey);
	const dayBeforeNextMonth = new Date(Date.UTC(year, month, 0));
	return dayBeforeNextMonth.toISOString().slice(0, isoDateLength);
}

/** The month that many months on, or back when the count is below zero. */
export function shiftMonth(monthKey: MonthKey, monthsToAdd: number): MonthKey {
	const [year, month] = splitMonthKey(monthKey);
	const firstOfShiftedMonth = new Date(Date.UTC(year, month - 1 + monthsToAdd, 1));
	return firstOfShiftedMonth.toISOString().slice(0, monthKeyLength);
}

/** The month a day falls in: 2026-11 for 2026-11-10. */
export function monthOfDay(isoDate: string): MonthKey {
	return isoDate.slice(0, monthKeyLength);
}

/** The month as a person says it: November 2026. */
export function describeMonth(monthKey: MonthKey): string {
	const [year, month] = splitMonthKey(monthKey);
	return `${monthName(month)} ${year}`;
}

function splitMonthKey(monthKey: MonthKey): [number, number] {
	const [year, month] = monthKey.split('-').map(Number);
	return [year, month];
}
