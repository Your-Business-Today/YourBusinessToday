import { describe, expect, it } from 'vitest';
import { buildCashflowForecast, firstMonthOverdrawn, forecastMonthsFrom } from './cashflowForecast';
import { forecastEntriesOfItems } from './forecastEntriesOfItems';
import type { CashflowItem } from './cashflowItem';

const months = forecastMonthsFrom('2026-11');

const item = (fields: Partial<CashflowItem>): CashflowItem => ({
	id: 'item',
	title: 'Hosting',
	direction: 'out',
	amount: 100,
	repeats: 'monthly',
	firstMonth: '2026-11',
	lastMonth: null,
	notes: '',
	...fields
});

const monthsOf = (found: CashflowItem) => forecastEntriesOfItems([found], months).map((entry) => entry.month);

describe('the months a forecast item comes round in', () => {
	it('covers twelve months from the month the forecast is read in', () => {
		expect(months).toHaveLength(12);
		expect([months[0], months[11]]).toEqual(['2026-11', '2027-10']);
	});

	it('counts a monthly item every month from its first to its last', () => {
		expect(monthsOf(item({ firstMonth: '2027-01', lastMonth: '2027-03' }))).toEqual(['2027-01', '2027-02', '2027-03']);
	});

	it('counts a quarterly item every third month and a yearly one once a year', () => {
		expect(monthsOf(item({ repeats: 'quarterly', firstMonth: '2026-10' }))).toEqual(['2027-01', '2027-04', '2027-07', '2027-10']);
		expect(monthsOf(item({ repeats: 'yearly', firstMonth: '2026-03' }))).toEqual(['2027-03']);
	});

	it('counts an item that comes once in its first month alone', () => {
		expect(monthsOf(item({ repeats: 'once', firstMonth: '2027-02' }))).toEqual(['2027-02']);
		expect(monthsOf(item({ repeats: 'once', firstMonth: '2026-10' }))).toEqual([]);
	});
});

describe('the forecast built from the cash at bank and the entries', () => {
	it('carries the balance on month by month, to the penny', () => {
		const entries = forecastEntriesOfItems(
			[item({ title: 'Repayment', amount: 400.76 }), item({ title: 'Portal fees', direction: 'in', amount: 3000, repeats: 'once', firstMonth: '2026-12' })],
			months
		);
		const forecast = buildCashflowForecast(1000.1, months, entries);
		expect(forecast.months[0]).toEqual({ month: '2026-11', moneyIn: 0, moneyOut: 400.76, net: -400.76, closingBalance: 599.34 });
		expect(forecast.months[1]).toEqual({ month: '2026-12', moneyIn: 3000, moneyOut: 400.76, net: 2599.24, closingBalance: 3198.58 });
		expect(forecast.months[11].closingBalance).toBe(-809.02);
	});

	it('names the first month the cash runs out, or none when it lasts', () => {
		const entries = forecastEntriesOfItems([item({ amount: 300 })], months);
		expect(firstMonthOverdrawn(buildCashflowForecast(1000, months, entries))).toBe('2027-02');
		expect(firstMonthOverdrawn(buildCashflowForecast(10000, months, entries))).toBeNull();
	});
});
