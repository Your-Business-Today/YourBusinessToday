import { describe, expect, it } from 'vitest';
import type { LoanStatement, LoanStatementLine } from '../loans/loanStatement';
import { describeOverdrawnStretch, loanStatementRowsOf } from './loanStatementRows';

const lineOn = (journalDate: string, balance: number): LoanStatementLine => ({ journalDate, description: 'Drawings', moneyIn: 0, moneyOut: 10, balance });

const statement: LoanStatement = {
	throughDate: '2026-11-13',
	lines: [lineOn('2026-03-01', 50), lineOn('2026-03-03', -20), lineOn('2026-03-10', 5), lineOn('2026-04-02', -40)],
	totalIn: 0,
	totalOut: 40,
	balance: -40,
	overdrawnStretches: [
		{ from: '2026-03-03', to: '2026-03-10', mostOwed: 20 },
		{ from: '2026-04-02', to: null, mostOwed: 40 }
	],
	yearEnds: []
};

describe('loanStatementRowsOf', () => {
	it('marks the entries on the days the account was overdrawn, up to the day it came back', () => {
		expect(loanStatementRowsOf(statement).map((row) => row.isOverdrawn)).toEqual([false, true, false, true]);
	});
});

describe('describeOverdrawnStretch', () => {
	it('says from when to when, and the most owed', () => {
		const [ended, open] = statement.overdrawnStretches;
		expect(describeOverdrawnStretch(ended)).toBe('Overdrawn from 3 Mar 2026 to 10 Mar 2026, owing at most £20.00.');
		expect(describeOverdrawnStretch(open)).toBe('Overdrawn since 2 Apr 2026, owing at most £40.00.');
	});
});
