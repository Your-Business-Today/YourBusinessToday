import { describe, expect, it } from 'vitest';
import type { BankReconciliation } from '../reconciliation/bankReconciliation';
import { describeBankPageStanding } from './bankStanding';

const reconciliationOf = (changes: Partial<BankReconciliation>): BankReconciliation => ({
	asAt: '2026-11-10',
	statementBalance: 1250,
	booksBalance: 1250,
	difference: 0,
	unmatchedLines: { count: 0, moneyIn: 0, moneyOut: 0 },
	unlinedEntries: [],
	isReconciled: true,
	...changes
});

describe('describeBankPageStanding', () => {
	it('says when no statement has been brought in', () => {
		expect(describeBankPageStanding(null)).toMatch(/^No bank statement has been brought in yet\./);
	});

	it('says the day the bank is reconciled to', () => {
		expect(describeBankPageStanding(reconciliationOf({}))).toBe('Reconciled to 10 Nov 2026.');
	});

	it('says how many lines are left to match, with both balances', () => {
		const standing = reconciliationOf({ booksBalance: 1190, difference: 60, isReconciled: false, unmatchedLines: { count: 12, moneyIn: 0, moneyOut: 60 } });
		expect(describeBankPageStanding(standing)).toBe('12 lines to match. The statement says £1,250.00 and the books £1,190.00.');
	});

	it('leaves the balances out when no line gives the statement a balance', () => {
		const standing = reconciliationOf({ statementBalance: null, difference: null, isReconciled: false, unmatchedLines: { count: 1, moneyIn: 5, moneyOut: 0 } });
		expect(describeBankPageStanding(standing)).toBe('1 line to match.');
	});

	it('says so when every line is matched but the bank still does not agree', () => {
		const standing = reconciliationOf({ booksBalance: 1200, difference: 50, isReconciled: false });
		expect(describeBankPageStanding(standing)).toBe(
			'Every line is matched, but the bank does not agree with the statement at 10 Nov 2026. The statement says £1,250.00 and the books £1,200.00.'
		);
	});
});
