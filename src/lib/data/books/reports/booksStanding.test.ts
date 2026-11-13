import { describe, expect, it } from 'vitest';
import { buildBooksStanding } from './booksStanding';
import { firstQuarterEntries } from './ledgerEntries.fixtures';
import type { LedgerEntry } from '../ledgerEntry';

const aprilYearStart = { startMonth: 4, firstPeriod: null };

const tradeCreditors = { accountId: 'account-2100', accountCode: '2100', accountName: 'Trade creditors', accountType: 'liability' } as const;
const rent = { accountId: 'account-5000', accountCode: '5000', accountName: 'Rent', accountType: 'expense' } as const;
const rentBilledNotPaid: LedgerEntry[] = [
	{ journalDate: '2026-06-25', ...rent, costCentreId: null, debit: 450, credit: 0 },
	{ journalDate: '2026-06-25', ...tradeCreditors, costCentreId: null, debit: 0, credit: 450 }
];

describe('buildBooksStanding', () => {
	it('stands the bank and what customers owe at the month end, beside the month and the year to date', () => {
		const standing = buildBooksStanding(firstQuarterEntries, '2026-05', aprilYearStart);
		expect(standing).toEqual({
			monthKey: '2026-05',
			bank: 10050,
			debtors: 1200,
			creditors: 0,
			income: { period: 1000, yearToDate: 1000 },
			costs: { period: 0, yearToDate: 0 },
			netProfit: { period: 1000, yearToDate: 1000 }
		});
	});

	it('leaves out what is posted after the month, and what fell in the year before', () => {
		const standing = buildBooksStanding(firstQuarterEntries, '2026-06', aprilYearStart);
		expect(standing.bank).toBe(10949.9);
		expect(standing.debtors).toBe(0);
		expect(standing.income).toEqual({ period: 0, yearToDate: 1000 });
		expect(standing.costs).toEqual({ period: 300.1, yearToDate: 300.1 });
		expect(standing.netProfit).toEqual({ period: -300.1, yearToDate: 699.9 });
	});

	it('shows what is owed to suppliers on costs billed and not yet paid', () => {
		const standing = buildBooksStanding([...firstQuarterEntries, ...rentBilledNotPaid], '2026-06', aprilYearStart);
		expect(standing.creditors).toBe(450);
		expect(standing.costs).toEqual({ period: 750.1, yearToDate: 750.1 });
	});
});
