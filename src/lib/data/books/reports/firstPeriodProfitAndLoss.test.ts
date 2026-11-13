import { describe, expect, it } from 'vitest';
import { buildProfitAndLoss } from './profitAndLoss';
import { buildBooksStanding } from './booksStanding';
import { validateReportPeriod, type ReportPeriod } from './reportPeriod';
import type { LedgerEntry } from '../ledgerEntry';

const yourBusinessToday = { startMonth: 8, firstPeriod: { start: '2026-07-09', end: '2027-07-31' } };
const software = { accountId: 'account-6000', accountCode: '6000', accountName: 'Software', accountType: 'expense' } as const;
const sales = { accountId: 'account-4000', accountCode: '4000', accountName: 'Sales', accountType: 'income' } as const;
const cost = (journalDate: string, amount: number): LedgerEntry => ({ journalDate, ...software, costCentreId: null, debit: amount, credit: 0 });
const sale = (journalDate: string, amount: number): LedgerEntry => ({ journalDate, ...sales, costCentreId: null, debit: 0, credit: amount });
const entries = [cost('2026-07-15', 180), cost('2026-09-02', 554.89), sale('2026-10-20', 600), cost('2027-07-20', 40), cost('2027-09-03', 25)];
const periodOf = (start: string, end: string) => validateReportPeriod(start, end, yourBusinessToday) as ReportPeriod;

describe('the profit and loss of a company in its first accounting period', () => {
	it('reads the same for the period from its first day and for the year to date', () => {
		const report = buildProfitAndLoss(entries, periodOf('2026-07-09', '2026-11-10'), null);
		expect(report.netProfit).toEqual({ period: -134.89, yearToDate: -134.89 });
		expect(report.totalExpenses).toEqual({ period: 734.89, yearToDate: 734.89 });
	});

	it('keeps the days before the start month in the year to date up to the first period last day', () => {
		const report = buildProfitAndLoss(entries, periodOf('2027-07-01', '2027-07-31'), null);
		expect(report.totalExpenses).toEqual({ period: 40, yearToDate: 774.89 });
	});

	it('starts the next year on the first of the start month', () => {
		const september = periodOf('2027-09-01', '2027-09-30');
		expect(september.yearStart).toBe('2027-08-01');
		expect(buildProfitAndLoss(entries, september, null).totalExpenses).toEqual({ period: 25, yearToDate: 25 });
	});

	it('gives the overview the same year to date', () => {
		expect(buildBooksStanding(entries, '2026-11', yourBusinessToday).costs).toEqual({ period: 0, yearToDate: 734.89 });
		expect(buildBooksStanding(entries, '2027-09', yourBusinessToday).costs).toEqual({ period: 25, yearToDate: 25 });
	});
});
