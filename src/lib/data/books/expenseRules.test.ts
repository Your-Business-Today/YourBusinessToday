import { describe, expect, it } from 'vitest';
import { expensePaymentRefusal, isCostAccount, validateExpense } from './expenseRules';

const accountId = '00000000-0000-4000-8000-000000006100';
const given = { expenseDate: '2026-11-05', supplier: 'Adobe', amount: '84.99', expenseAccountId: accountId };

describe('a cost from a supplier', () => {
	it('is kept as given, with what was left out taking the column defaults', () => {
		const { expenseAccountId, ...details } = given;
		const kept = { ...details, amount: 84.99, description: '', costCentreId: null, isPaid: false };
		expect(validateExpense(given)).toEqual({ ...kept, costAccount: { isPaidUpFront: false, expenseAccountId } });
	});

	it('is coded to Prepayments when paid up front, in place of an account, never as well as one', () => {
		const { expenseAccountId, ...paidUpFront } = { ...given, isPaidUpFront: true };
		expect(validateExpense(paidUpFront)).toEqual(expect.objectContaining({ costAccount: { isPaidUpFront: true } }));
		expect(validateExpense({ ...paidUpFront, expenseAccountId })).toContain('Give expenseAccountId or isPaidUpFront, not both');
		expect(validateExpense({ ...paidUpFront, isPaidUpFront: 1 })).toBe('isPaidUpFront is true or false; 1 was given.');
		expect(validateExpense({ ...paidUpFront, isPaidUpFront: false })).toContain('The expense account must be an id');
	});

	it('is refused, never repaired, when a column cannot hold it', () => {
		expect(validateExpense({ ...given, description: 12 })).toBe('description is text; 12 was given.');
		expect(validateExpense({ ...given, costCentreId: 'projects' })).toContain('The cost centre must be an id');
		expect(validateExpense({ ...given, expenseAccountId: undefined })).toContain('The expense account must be an id');
		expect(validateExpense({ ...given, amount: -5 })).toBe('amount cannot be below zero; -5 was given.');
	});

	it('is coded to an expense account, or to Prepayments at 1300, and to nothing else', () => {
		expect(isCostAccount({ code: '6100', account_type: 'expense' })).toBe(true);
		expect(isCostAccount({ code: '1300', account_type: 'asset' })).toBe(true);
		expect(isCostAccount({ code: '1200', account_type: 'asset' })).toBe(false);
		expect(isCostAccount({ code: '1300', account_type: 'liability' })).toBe(false);
	});

	it('is paid only once', () => {
		expect(expensePaymentRefusal({ supplier: 'Adobe', paidOn: null })).toBeNull();
		expect(expensePaymentRefusal({ supplier: 'Adobe', paidOn: '2026-11-20' })).toBe('The cost from Adobe was paid on 20 Nov 2026 already.');
	});
});
