import { financialYearStart } from '../reports/reportPeriod';
import { monthEnd, monthOfDay, shiftMonth } from '../monthKey';
import { balanceAtEndOf, type DayEndBalance } from './dayEndBalances';

/** The balance a loan account stood at when a financial year closed. */
export type YearEndBalance = { yearEnd: string; balance: number };

const monthsInYear = 12;
const lastMonthOfYear = monthsInYear - 1;

/** The balance at each financial year end from the year the first entry fell in, to the last day read. */
export function yearEndBalances(dayEnds: DayEndBalance[], yearStartMonth: number, lastDay: string): YearEndBalance[] {
	const firstDay = dayEnds[0]?.date;
	if (firstDay === undefined) return [];
	return financialYearEnds(firstDay, lastDay, yearStartMonth).map((yearEnd) => ({ yearEnd, balance: balanceAtEndOf(yearEnd, dayEnds) }));
}

/** The last day of each financial year that ends on or after the first day and on or before the last. */
export function financialYearEnds(firstDay: string, lastDay: string, yearStartMonth: number): string[] {
	const yearEnds: string[] = [];
	let lastMonth = shiftMonth(monthOfDay(financialYearStart(firstDay, yearStartMonth)), lastMonthOfYear);
	while (monthEnd(lastMonth) <= lastDay) {
		yearEnds.push(monthEnd(lastMonth));
		lastMonth = shiftMonth(lastMonth, monthsInYear);
	}
	return yearEnds;
}
