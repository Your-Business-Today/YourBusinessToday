import { describe, expect, it } from 'vitest';
import { buildProfitAndLoss } from './profitAndLoss';
import { costCentres, firstQuarterEntries } from './ledgerEntries.fixtures';
import { validateReportPeriod, type ReportPeriod } from './reportPeriod';

const aprilYearStart = { startMonth: 4, firstPeriod: null };
const june = validateReportPeriod('2026-06-01', '2026-06-30', aprilYearStart) as ReportPeriod;

describe('buildProfitAndLoss', () => {
	it('gives the month and the financial year to date, leaving out last year and later months', () => {
		const report = buildProfitAndLoss(firstQuarterEntries, june, null);
		expect(report.income).toEqual([{ accountCode: '4000', accountName: 'Sales', period: 0, yearToDate: 1000 }]);
		expect(report.expenses).toEqual([{ accountCode: '5000', accountName: 'Rent', period: 300.1, yearToDate: 300.1 }]);
		expect(report.totalIncome).toEqual({ period: 0, yearToDate: 1000 });
		expect(report.totalExpenses).toEqual({ period: 300.1, yearToDate: 300.1 });
		expect(report.netProfit).toEqual({ period: -300.1, yearToDate: 699.9 });
	});

	it('reads one cost centre alone', () => {
		const report = buildProfitAndLoss(firstQuarterEntries, june, costCentres.shop);
		expect(report.expenses).toEqual([]);
		expect(report.netProfit).toEqual({ period: 0, yearToDate: 1000 });
	});
});

describe('validateReportPeriod', () => {
	it('finds the start of the financial year the period ends in', () => {
		expect(validateReportPeriod('2026-03-01', '2026-03-31', aprilYearStart)).toEqual({
			start: '2026-03-01',
			end: '2026-03-31',
			yearStart: '2025-04-01'
		});
		expect((validateReportPeriod('2026-04-01', '2026-04-30', aprilYearStart) as ReportPeriod).yearStart).toBe('2026-04-01');
		expect((validateReportPeriod('2026-11-01', '2026-11-30', { startMonth: 1, firstPeriod: null }) as ReportPeriod).yearStart).toBe('2026-01-01');
	});

	it('refuses a period that ends before it starts, or a day that is not one', () => {
		expect(validateReportPeriod('2026-07-01', '2026-06-30', aprilYearStart)).toBe('periodStart (2026-07-01) is after periodEnd (2026-06-30).');
		expect(validateReportPeriod('2026-06-31', '2026-07-30', aprilYearStart)).toMatch(/^periodStart is not a day/);
		expect(validateReportPeriod('2026-06-01', 'June', aprilYearStart)).toMatch(/^periodEnd is a date/);
	});
});
