import { describe, expect, it } from 'vitest';
import { forecastMonthsFrom } from '../cashflow/cashflowForecast';
import { forecastEntriesOfLoanBudgets } from './forecastEntriesOfLoanBudgets';
import { validateLoanBudgetLine, validateLoanDraw } from './loanBudgetLineRules';
import { validateLoanBudget, validateLoanBudgetChange } from './loanBudgetRules';
import { overBudgetRefusal, overDrawnRefusal, totalsOf } from './loanBudgetTotals';
import type { LoanBudget } from './loanBudget';

const startUpLoan = {
	title: 'Start Up Loan',
	loanAmount: 20000,
	repaidTo: 'Jeremy Ferendinos',
	monthlyRepayment: 400.76,
	firstRepaymentMonth: '2027-01',
	repaymentMonths: 60
};

const nigelsApproval = { approvedByName: 'Nigel', approvedAt: '2026-11-26T10:00:00Z' };

const budget: LoanBudget = {
	...startUpLoan,
	id: 'loan',
	notes: '',
	draws: [{ id: 'first', month: '2026-12', amount: 10000 }],
	lines: [
		{ id: 'laptops', purpose: 'Laptops', amount: 3000, expectedReturn: 'Two more builders', approval: nigelsApproval, spends: [] },
		{ id: 'ads', purpose: 'Advertising', amount: 5000, expectedReturn: 'Three new clients', approval: null, spends: [] }
	]
};

describe('a loan budget checked against its columns', () => {
	it('keeps the loan as the directors gave it, with no notes when left out', () => {
		expect(validateLoanBudget(startUpLoan)).toEqual({ ...startUpLoan, notes: '' });
		expect(validateLoanBudget({ ...startUpLoan, loanAmount: '20000.00' })).toMatchObject({ loanAmount: 20000 });
	});

	it('refuses what the columns cannot hold, naming the field', () => {
		expect(validateLoanBudget({ ...startUpLoan, monthlyRepayment: 0 })).toBe('monthlyRepayment is above zero; 0 was given.');
		expect(validateLoanBudget({ ...startUpLoan, repaymentMonths: 2.5 })).toContain('repaymentMonths is a whole number of months from 1 to 600');
		expect(validateLoanBudget({ ...startUpLoan, repaidTo: ' Jeremy' })).toContain('repaidTo starts or ends with a space');
		expect(validateLoanBudgetChange({})).toContain('Give at least one of');
		expect(validateLoanBudgetChange({ monthlyRepayment: 410 })).toEqual({ monthlyRepayment: 410 });
	});

	it('asks every line for its purpose, amount and expected return, and every draw for its month and amount', () => {
		expect(validateLoanBudgetLine({ purpose: 'Laptops', amount: 3000 })).toBe('expectedReturn is needed; it was left out.');
		expect(validateLoanDraw({ month: '2026-12-01', amount: 5000 })).toContain('month is a month written as 2026-11');
	});
});

describe('what a loan budget comes to', () => {
	it('adds up its lines, what is approved and what is drawn', () => {
		expect(totalsOf(budget)).toEqual({ budgeted: 8000, approved: 3000, unbudgeted: 12000, drawn: 10000, undrawn: 10000, spent: 0 });
	});

	it('refuses lines or draws that would come to more than the loan, saying what is left', () => {
		expect(overBudgetRefusal(budget, 12000, null)).toBeNull();
		expect(overBudgetRefusal(budget, 12000.01, null)).toContain('£12,000.00 is left to budget');
		expect(overBudgetRefusal(budget, 17000, 'ads')).toBeNull();
		expect(overDrawnRefusal(budget, 10000.5, null)).toContain('£10,000.00 is left to draw');
	});

	it('shows the draws as money in and every repayment as money out in the forecast', () => {
		const entries = forecastEntriesOfLoanBudgets([budget], forecastMonthsFrom('2026-11'));
		expect(entries[0]).toEqual({ month: '2026-12', source: 'Start Up Loan: drawn', direction: 'in', amount: 10000 });
		const repayments = entries.filter((entry) => entry.direction === 'out');
		expect(repayments).toHaveLength(10);
		expect(repayments[0]).toEqual({ month: '2027-01', source: 'Start Up Loan: repayment to Jeremy Ferendinos', direction: 'out', amount: 400.76 });
	});
});
