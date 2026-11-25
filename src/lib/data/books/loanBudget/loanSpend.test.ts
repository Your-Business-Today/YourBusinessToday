import { describe, expect, it } from 'vitest';
import { belowSpentRefusal, spendingOf, spendRefusal } from './loanLineSpending';
import { validateLoanSpend } from './loanSpendRules';
import type { LoanBudgetLine } from './loanBudget';

const approval = { approvedByName: 'Nigel Reilly', approvedAt: '2026-11-26T10:00:00Z' };

const firstLaptop = { id: 'first', spentOn: '2026-12-03', amount: 1200, description: 'One laptop', expenseId: null };

const laptops: LoanBudgetLine = { id: 'laptops', purpose: 'Laptops', amount: 3000, expectedReturn: 'Two more builds', approval, spends: [firstLaptop] };

const given = { spentOn: '2026-12-03', amount: '1200.00', description: 'One laptop' };

describe('a spend from the loan checked against its columns', () => {
	it('keeps the day, amount and what it was, with no matching cost unless one is given', () => {
		expect(validateLoanSpend(given)).toEqual({ ...given, amount: 1200, expenseId: null });
		expect(validateLoanSpend({ ...given, expenseId: '00000000-0000-4000-8000-000000000001' })).toMatchObject({
			expenseId: '00000000-0000-4000-8000-000000000001'
		});
	});

	it('refuses what the columns cannot hold, naming the field', () => {
		expect(validateLoanSpend({ ...given, spentOn: '2026-12' })).toBe('spentOn is a date written as 2026-11-30.');
		expect(validateLoanSpend({ ...given, amount: 0 })).toBe('amount is above zero; 0 was given.');
		expect(validateLoanSpend({ ...given, description: undefined })).toBe('description is needed; it was left out.');
		expect(validateLoanSpend({ ...given, expenseId: 'cost 4' })).toContain('The expense must be an id');
	});
});

describe('what is spent from a line', () => {
	it('adds up its spends and what is left', () => {
		expect(spendingOf(laptops)).toEqual({ spent: 1200, left: 1800 });
	});

	it('refuses a spend from a line no director has approved, or past what is left on it', () => {
		expect(spendRefusal(laptops, 1800)).toBeNull();
		expect(spendRefusal(laptops, 1800.01)).toBe('That would take Laptops past its £3,000.00; £1,800.00 is left on it.');
		expect(spendRefusal({ ...laptops, approval: null }, 1)).toBe('Laptops awaits a director’s approval, so nothing may be spent from it yet.');
	});

	it('refuses bringing a line below what has been spent from it', () => {
		expect(belowSpentRefusal(laptops, 1200)).toBeNull();
		expect(belowSpentRefusal(laptops, 1000)).toBe('£1,200.00 has already been spent from Laptops, so it cannot come down to £1,000.00.');
	});
});
