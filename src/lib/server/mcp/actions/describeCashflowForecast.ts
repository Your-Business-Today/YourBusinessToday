import { firstMonthOverdrawn, type ForecastMonth } from '$lib/data/books/cashflow/cashflowForecast';
import { cashflowRepeatLabels, CashflowDirections, type CashflowItem } from '$lib/data/books/cashflow/cashflowItem';
import { formatPoundsAndPence } from '$lib/data/books/money';
import { describeMonth } from '$lib/data/books/monthKey';
import type { CashflowForecastReading } from '$lib/server/books/cashflowForecastReading';

/** The forecast as the connector answers it: where the cash starts, each month, when it runs out, then every item kept. */
export function describeCashflowForecast(organisationName: string, reading: CashflowForecastReading): string {
	const { forecast, items, asAt } = reading;
	const overdrawn = firstMonthOverdrawn(forecast);
	const runsOut = overdrawn === null ? 'The cash lasts the twelve months.' : `The cash runs out in ${describeMonth(overdrawn)}.`;
	return [
		`${organisationName}'s cashflow forecast, from ${formatPoundsAndPence(forecast.openingBalance)} at bank at the end of ${asAt}:`,
		...forecast.months.map(describeForecastMonth),
		runsOut,
		'Running billing schedules count as money in by themselves, in the month each invoice falls due.',
		describeCashflowItems(items)
	].join('\n');
}

/** One item as the connector names it, with its id for a change. */
export function describeCashflowItemLine(item: CashflowItem): string {
	const way = item.direction === CashflowDirections.moneyIn ? 'in' : 'out';
	const until = item.lastMonth === null ? '' : ` to ${describeMonth(item.lastMonth)}`;
	const notes = item.notes === '' ? '' : ` Notes: ${item.notes}`;
	const when = `${cashflowRepeatLabels[item.repeats].toLowerCase()} from ${describeMonth(item.firstMonth)}${until}`;
	return `- ${item.title}: ${formatPoundsAndPence(item.amount)} ${way}, ${when} (id ${item.id}).${notes}`;
}

function describeCashflowItems(items: CashflowItem[]): string {
	if (items.length === 0) return 'No forecast items are kept yet; add_cashflow_item adds one as the directors give it.';
	return ['Forecast items kept:', ...items.map(describeCashflowItemLine)].join('\n');
}

function describeForecastMonth(month: ForecastMonth): string {
	const moneyIn = formatPoundsAndPence(month.moneyIn);
	const moneyOut = formatPoundsAndPence(month.moneyOut);
	return `- ${describeMonth(month.month)}: ${moneyIn} in, ${moneyOut} out, ${formatPoundsAndPence(month.closingBalance)} at the end.`;
}
