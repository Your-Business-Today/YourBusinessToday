import { describe, expect, it } from 'vitest';
import { describeLoansStanding, type LoanRow } from './loanRows';

const loanOf = (personName: string, balance: number): LoanRow => ({
	id: personName,
	personName,
	relationship: 'director',
	balance,
	owedInWords: '',
	lastMovement: '2026-11-01',
	isClosed: false,
	statement: { throughDate: '2026-11-13', lines: [], totalIn: 0, totalOut: 0, balance, overdrawnStretches: [], yearEnds: [] }
});

describe('describeLoansStanding', () => {
	it('says when no loan account is kept', () => {
		expect(describeLoansStanding([])).toMatch(/^No loan accounts are kept yet\./);
	});

	it('sums what the company owes and what it is owed, to the penny', () => {
		const loans = [loanOf('Sam', 250.1), loanOf('Alex', 0.2), loanOf('Jo', -119.25)];
		expect(describeLoansStanding(loans)).toBe('3 loan accounts: the company owes £250.30 on them and is owed £119.25.');
	});

	it('names one account as one', () => {
		expect(describeLoansStanding([loanOf('Sam', 0)])).toBe('One loan account: the company owes £0.00 on them and is owed £0.00.');
	});
});
