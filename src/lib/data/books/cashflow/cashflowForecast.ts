import { differenceOf, fromPence, toPence } from '../money';
import { shiftMonth, type MonthKey } from '../monthKey';
import { CashflowDirections, type CashflowDirection } from './cashflowItem';

/** How many months the forecast looks ahead, the month it is read in first. */
export const forecastMonthCount = 12;

/** One sum of money the forecast expects in a month: where it comes from, which way it moves and how much. */
export type ForecastEntry = { month: MonthKey; source: string; direction: CashflowDirection; amount: number };

/** A month of the forecast: what comes in, what goes out, the difference and the cash at the end of it. */
export type ForecastMonth = { month: MonthKey; moneyIn: number; moneyOut: number; net: number; closingBalance: number };

/** The forecast: the cash it starts from and each month from the first. */
export type CashflowForecast = { openingBalance: number; months: ForecastMonth[] };

/** The months the forecast covers, starting with the one given. */
export function forecastMonthsFrom(firstMonth: MonthKey): MonthKey[] {
	return Array.from({ length: forecastMonthCount }, (_, offset) => shiftMonth(firstMonth, offset));
}

/** Each month's money in and out from the entries falling in it, the balance carried on from the cash the forecast starts with. */
export function buildCashflowForecast(openingBalance: number, months: MonthKey[], entries: ForecastEntry[]): CashflowForecast {
	let balancePence = toPence(openingBalance);
	const forecastMonths = months.map((month) => {
		const inMonth = entries.filter((entry) => entry.month === month);
		const moneyIn = totalOf(inMonth, CashflowDirections.moneyIn);
		const moneyOut = totalOf(inMonth, CashflowDirections.moneyOut);
		const net = differenceOf(moneyIn, moneyOut);
		balancePence += toPence(net);
		return { month, moneyIn, moneyOut, net, closingBalance: fromPence(balancePence) };
	});
	return { openingBalance, months: forecastMonths };
}

/** The first month whose closing balance is below nothing, or null when the cash lasts the whole forecast. */
export function firstMonthOverdrawn(forecast: CashflowForecast): MonthKey | null {
	const overdrawn = forecast.months.find((month) => month.closingBalance < 0);
	return overdrawn?.month ?? null;
}

function totalOf(entries: ForecastEntry[], direction: CashflowDirection): number {
	const pence = entries.filter((entry) => entry.direction === direction).reduce((total, entry) => total + toPence(entry.amount), 0);
	return fromPence(pence);
}
