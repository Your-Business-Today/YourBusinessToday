import { describe, expect, it } from 'vitest';
import { buildBalanceSheet } from './balanceSheet';
import { firstQuarterEntries } from './ledgerEntries.fixtures';

const balanceOf = (accountCode: string, accountName: string, balance: number) => ({
	accountId: `account-${accountCode}`,
	accountCode,
	accountName,
	balance
});

describe('buildBalanceSheet', () => {
	it('balances what is owned against what is owed and invested, with every profit to date retained', () => {
		const sheet = buildBalanceSheet(firstQuarterEntries, '2026-06-30');
		expect(sheet.assets).toEqual([balanceOf('1200', 'Bank', 10949.9)]);
		expect(sheet.liabilities).toEqual([balanceOf('2200', 'VAT', 200)]);
		expect(sheet.equity).toEqual([balanceOf('3000', 'Capital', 10000)]);
		expect(sheet.retainedEarnings).toBe(749.9);
		expect(sheet.totalAssets).toBe(10949.9);
		expect(sheet.totalLiabilities).toBe(200);
		expect(sheet.totalEquity).toBe(10749.9);
		expect(sheet.isBalanced).toBe(true);
	});

	it('shows money still owed by customers on the day', () => {
		const sheet = buildBalanceSheet(firstQuarterEntries, '2026-05-31');
		expect(sheet.assets).toEqual([balanceOf('1100', 'Debtors', 1200), balanceOf('1200', 'Bank', 10050)]);
		expect(sheet.isBalanced).toBe(true);
	});
});
