import { describe, expect, it } from 'vitest';
import { buildTrialBalance } from './trialBalance';
import { accounts, firstQuarterEntries } from './ledgerEntries.fixtures';

function lineOf(code: string, debit: number, credit: number) {
	const posted = Object.values(accounts).find((account) => account.accountCode === code);
	return { ...posted, debit, credit };
}

describe('buildTrialBalance', () => {
	it('shows each account with a balance in its debit or credit column, by code, and the columns agree', () => {
		const trialBalance = buildTrialBalance(firstQuarterEntries, '2026-06-30');
		expect(trialBalance.lines).toEqual([
			lineOf('1200', 10949.9, 0),
			lineOf('2200', 0, 200),
			lineOf('3000', 0, 10000),
			lineOf('4000', 0, 1050),
			lineOf('5000', 300.1, 0)
		]);
		expect(trialBalance.totalDebit).toBe(11250);
		expect(trialBalance.totalCredit).toBe(11250);
		expect(trialBalance.isBalanced).toBe(true);
	});

	it('leaves out what was posted after the day and accounts that have come back to nothing', () => {
		const trialBalance = buildTrialBalance(firstQuarterEntries, '2026-05-31');
		expect(trialBalance.lines.map((line) => line.accountCode)).toEqual(['1100', '1200', '2200', '3000', '4000']);
		expect(trialBalance.totalDebit).toBe(11250);
	});

	it('says when the columns do not agree', () => {
		const lopsided = firstQuarterEntries.slice(0, 3);
		expect(buildTrialBalance(lopsided, '2026-12-31').isBalanced).toBe(false);
	});

	it('is empty for books with nothing posted', () => {
		expect(buildTrialBalance([], '2026-06-30')).toEqual({
			asAt: '2026-06-30',
			lines: [],
			totalDebit: 0,
			totalCredit: 0,
			isBalanced: true
		});
	});
});
