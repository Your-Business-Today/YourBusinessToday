import type { MonthKey } from '../monthKey';
import { CashflowRepeats, monthsBetweenRepeats, type CashflowItem } from './cashflowItem';
import type { ForecastEntry } from './cashflowForecast';

const monthsInYear = 12;

/** Every time each item comes round in the months given, as the forecast's entries. */
export function forecastEntriesOfItems(items: CashflowItem[], months: MonthKey[]): ForecastEntry[] {
	return items.flatMap((item) =>
		months.filter((month) => isItemMonth(item, month)).map((month) => ({ month, source: item.title, direction: item.direction, amount: item.amount }))
	);
}

/** Whether the item comes round in the month: on or after its first, no later than its last, a whole number of repeats on. */
export function isItemMonth(item: CashflowItem, month: MonthKey): boolean {
	if (item.repeats === CashflowRepeats.once) return month === item.firstMonth;
	const isWithinItsMonths = month >= item.firstMonth && (item.lastMonth === null || month <= item.lastMonth);
	if (!isWithinItsMonths) return false;
	return monthsApart(item.firstMonth, month) % monthsBetweenRepeats[item.repeats] === 0;
}

function monthsApart(earlier: MonthKey, later: MonthKey): number {
	return monthIndex(later) - monthIndex(earlier);
}

function monthIndex(month: MonthKey): number {
	const [year, monthOfYear] = month.split('-').map(Number);
	return year * monthsInYear + monthOfYear;
}
