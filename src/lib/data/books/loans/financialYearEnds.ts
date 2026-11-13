import { financialYearStart, type FinancialYear } from '../financialYear';
import { monthEnd, monthOfDay, shiftMonth } from '../monthKey';
import { balanceAtEndOf, type DayEndBalance } from './dayEndBalances';

/** The balance a loan account stood at when a financial year closed. */
export type YearEndBalance = { yearEnd: string; balance: number };

const monthsInYear = 12;
const lastMonthOfYear = monthsInYear - 1;

/** The balance at each financial year end from the year the first entry fell in, to the last day read. */
export function yearEndBalances(dayEnds: DayEndBalance[], financialYear: FinancialYear, lastDay: string): YearEndBalance[] {
	const firstDay = dayEnds[0]?.date;
	if (firstDay === undefined) return [];
	return financialYearEnds(firstDay, lastDay, financialYear).map((yearEnd) => ({ yearEnd, balance: balanceAtEndOf(yearEnd, dayEnds) }));
}

/** The last day of each financial year that ends on or after the first day and on or before the last. */
export function financialYearEnds(firstDay: string, lastDay: string, financialYear: FinancialYear): string[] {
	const yearEnds: string[] = [];
	let yearEnd = endOfYearHolding(firstDay, financialYear);
	while (yearEnd <= lastDay) {
		yearEnds.push(yearEnd);
		yearEnd = monthEnd(shiftMonth(monthOfDay(yearEnd), monthsInYear));
	}
	return yearEnds;
}

/** The last day of the financial year the day falls in: the first period's last day within it, else twelve months on. */
function endOfYearHolding(day: string, financialYear: FinancialYear): string {
	const { firstPeriod } = financialYear;
	const isInFirstPeriod = firstPeriod !== null && day <= firstPeriod.end;
	if (isInFirstPeriod) return firstPeriod.end;
	const yearStart = financialYearStart(day, financialYear);
	return monthEnd(shiftMonth(monthOfDay(yearStart), lastMonthOfYear));
}
