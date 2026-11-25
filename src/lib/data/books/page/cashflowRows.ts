import { firstMonthOverdrawn, type CashflowForecast } from '../cashflow/cashflowForecast';
import { CashflowRepeats, cashflowDirectionLabels, cashflowRepeatLabels, type CashflowItem } from '../cashflow/cashflowItem';
import { formatPoundsAndPence } from '../money';
import { describeMonth } from '../monthKey';

/** A month as the Cashflow tab lists it. */
export type ForecastMonthRow = { month: string; monthInWords: string; moneyIn: number; moneyOut: number; net: number; closingBalance: number };

/** A forecast item as the Cashflow tab lists it, its months in words. */
export type CashflowItemRow = { id: string; title: string; way: string; amount: number; repeats: string; months: string; notes: string };

const carriesOn = 'no end';

export function forecastMonthRowsOf(forecast: CashflowForecast): ForecastMonthRow[] {
	return forecast.months.map((month) => ({ ...month, monthInWords: describeMonth(month.month) }));
}

export function cashflowItemRowsOf(items: CashflowItem[]): CashflowItemRow[] {
	return items.map((item) => ({
		id: item.id,
		title: item.title,
		way: cashflowDirectionLabels[item.direction],
		amount: item.amount,
		repeats: cashflowRepeatLabels[item.repeats],
		months: monthsInWords(item),
		notes: item.notes
	}));
}

/** Where the cash starts and whether it lasts, in the Cashflow tab's one line. */
export function describeCashflowStanding(forecast: CashflowForecast, asAt: string): string {
	const startsFrom = `${formatPoundsAndPence(forecast.openingBalance)} at bank at the end of ${asAt}`;
	const overdrawn = firstMonthOverdrawn(forecast);
	const lasts = overdrawn === null ? 'the cash lasts the twelve months' : `the cash runs out in ${describeMonth(overdrawn)}`;
	return `From ${startsFrom}, ${lasts}.`;
}

function monthsInWords(item: CashflowItem): string {
	const first = describeMonth(item.firstMonth);
	if (item.repeats === CashflowRepeats.once) return first;
	const last = item.lastMonth === null ? carriesOn : describeMonth(item.lastMonth);
	return `${first} to ${last}`;
}
