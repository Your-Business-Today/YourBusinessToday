import { describe, expect, it } from 'vitest';
import { validateNewLoanAccount } from './loanAccountRules';
import { loanAccountName, nextLoanAccountCode } from './nextLoanAccountCode';
import { whatIsOwed } from './whatIsOwed';

describe('a new loan account', () => {
	it('is kept as given, with or without the code of an account already in the chart', () => {
		expect(
			validateNewLoanAccount({
				personName: 'Sam Reilly',
				relationship: 'director'
			})
		).toEqual({
			personName: 'Sam Reilly',
			relationship: 'director',
			accountCode: null
		});
		expect(
			validateNewLoanAccount({
				personName: 'Sam Reilly',
				relationship: 'other',
				accountCode: '2300'
			})
		).toMatchObject({ accountCode: '2300' });
	});

	it('refuses by name what its columns cannot hold, never trimming or shortening it', () => {
		expect(
			validateNewLoanAccount({
				personName: 'S'.repeat(121),
				relationship: 'director'
			})
		).toBe('personName is at most 120 characters; 121 were given.');
		expect(validateNewLoanAccount({ personName: ' Sam', relationship: 'director' })).toBe(
			'personName starts or ends with a space; give it without one.'
		);
		expect(validateNewLoanAccount({ personName: 'Sam', relationship: 'partner' })).toBe(
			'relationship is one of director, shareholder, other; "partner" was given.'
		);
		expect(
			validateNewLoanAccount({
				personName: 'Sam',
				relationship: 'director',
				accountCode: ''
			})
		).toBe('accountCode cannot be blank.');
	});
});

describe('where the books put a new loan account', () => {
	it('takes the first code from 2300 in tens that the chart does not hold', () => {
		expect(nextLoanAccountCode(['1200', '2300', '2310', '2320'])).toBe('2330');
		expect(nextLoanAccountCode([])).toBe('2300');
		expect(loanAccountName('Sam Reilly')).toBe('Loan account: Sam Reilly');
	});

	it('finds no code when all ten are taken', () => {
		const everyCode = Array.from({ length: 10 }, (_unused, index) => String(2300 + index * 10));
		expect(nextLoanAccountCode(everyCode)).toBeNull();
	});
});

describe('what is owed, in words', () => {
	it('says which way round the balance stands', () => {
		expect(whatIsOwed('Sam', 250)).toBe('the company owes Sam £250.00');
		expect(whatIsOwed('Sam', -119.25)).toBe('Sam owes the company £119.25');
		expect(whatIsOwed('Sam', 0)).toBe('nothing is owed either way');
	});
});
