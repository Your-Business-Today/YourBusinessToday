import { describe, expect, it } from 'vitest';
import { buildCashflowForecast, forecastMonthsFrom } from '../cashflow/cashflowForecast';
import { cashflowItemRowsOf, describeCashflowStanding } from './cashflowRows';

const months = forecastMonthsFrom('2026-11');

describe('the Cashflow tab in words', () => {
	it('says where the cash starts and whether it lasts', () => {
		const lasting = buildCashflowForecast(500, months, []);
		expect(describeCashflowStanding(lasting, '2026-11-25')).toBe('From £500.00 at bank at the end of 2026-11-25, the cash lasts the twelve months.');
		const short = buildCashflowForecast(100, months, [{ month: '2027-01', source: 'Rent', direction: 'out', amount: 200 }]);
		expect(describeCashflowStanding(short, '2026-11-25')).toContain('the cash runs out in January 2027');
	});

	it('lists each item with which way it moves and its months', () => {
		const [row] = cashflowItemRowsOf([
			{ id: 'item', title: 'Repayment to Jeremy', direction: 'out', amount: 400.76, repeats: 'monthly', firstMonth: '2026-12', lastMonth: null, notes: '' }
		]);
		expect(row).toMatchObject({ way: 'Money out', repeats: 'Monthly', months: 'December 2026 to no end' });
	});
});
