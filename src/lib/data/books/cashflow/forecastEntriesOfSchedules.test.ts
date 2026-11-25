import { describe, expect, it } from 'vitest';
import { forecastMonthsFrom } from './cashflowForecast';
import { forecastEntriesOfSchedules, type ScheduleToForecast } from './forecastEntriesOfSchedules';

const months = forecastMonthsFrom('2026-11');

const schedule = (fields: Partial<ScheduleToForecast>): ScheduleToForecast => ({
	title: 'Portal fees',
	customerName: 'Jewel PFP',
	frequency: 'monthly',
	nextInvoiceDate: '2026-12-01',
	covers: 'in_advance',
	paymentTermsDays: null,
	sendsByItself: true,
	notes: '',
	isPaused: false,
	endsOn: null,
	lines: [{ description: 'Portal', quantity: 1, unitPrice: 1500, incomeAccountId: 'sales', costCentreId: null }],
	...fields
});

describe('the money running billing schedules bring into the forecast', () => {
	it('counts each invoice in the month it falls due, after the books’ days to pay', () => {
		const entries = forecastEntriesOfSchedules([schedule({})], months, 30);
		expect(entries[0]).toEqual({ month: '2026-12', source: 'Jewel PFP: Portal fees', direction: 'in', amount: 1500 });
		expect(entries.map((entry) => entry.month).slice(0, 3)).toEqual(['2026-12', '2027-01', '2027-03']);
	});

	it('counts one invoice a month from a monthly schedule paid on the day', () => {
		const entries = forecastEntriesOfSchedules([schedule({ paymentTermsDays: 0 })], months, 30);
		expect(entries.map((entry) => entry.month)).toEqual(months.slice(1));
	});

	it("takes the schedule's own days to pay over the books'", () => {
		const entries = forecastEntriesOfSchedules([schedule({ paymentTermsDays: 14, nextInvoiceDate: '2026-11-20' })], months, 30);
		expect(entries[0].month).toBe('2026-12');
	});

	it('stops at the last date, and brings nothing while paused', () => {
		const ending = forecastEntriesOfSchedules([schedule({ endsOn: '2027-02-28', paymentTermsDays: 0 })], months, 30);
		expect(ending.map((entry) => entry.month)).toEqual(['2026-12', '2027-01', '2027-02']);
		expect(forecastEntriesOfSchedules([schedule({ isPaused: true })], months, 30)).toEqual([]);
	});

	it('steps a quarterly schedule a quarter at a time', () => {
		const entries = forecastEntriesOfSchedules([schedule({ frequency: 'quarterly', paymentTermsDays: 0 })], months, 30);
		expect(entries.map((entry) => entry.month)).toEqual(['2026-12', '2027-03', '2027-06', '2027-09']);
	});
});
