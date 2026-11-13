import { monthEnd, monthOfDay, shiftMonth } from './monthKey';

/** A new company's first accounts: from the day it was formed to its first year end, often longer than twelve months. */
export type FirstAccountingPeriod = { start: string; end: string };

/** How an organisation's financial years run: the month each starts in, and the first period when one is set. */
export type FinancialYear = { startMonth: number; firstPeriod: FirstAccountingPeriod | null };

/** The first day of the financial year holding the day: the first period's first day up to its last, else the start month's first. */
export function financialYearStart(isoDate: string, financialYear: FinancialYear): string {
	const { firstPeriod } = financialYear;
	const isInFirstPeriod = firstPeriod !== null && isoDate <= firstPeriod.end;
	if (isInFirstPeriod) return firstPeriod.start;
	return firstOfYearStartMonth(isoDate, financialYear.startMonth);
}

/** Whether the day is the last before a financial year starting in the month (1 to 12) begins: 31 July for August. */
export function isDayBeforeYearStart(isoDate: string, startMonth: number): boolean {
	const month = monthOfDay(isoDate);
	const isLastDayOfMonth = isoDate === monthEnd(month);
	const [, followingMonth] = shiftMonth(month, 1).split('-').map(Number);
	return isLastDayOfMonth && followingMonth === startMonth;
}

function firstOfYearStartMonth(isoDate: string, startMonth: number): string {
	const [year, month] = isoDate.split('-').map(Number);
	const startYear = month >= startMonth ? year : year - 1;
	const writtenMonth = String(startMonth).padStart(2, '0');
	return `${startYear}-${writtenMonth}-01`;
}
