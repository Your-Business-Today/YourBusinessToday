import { describe, expect, it } from 'vitest';
import { validateSignedMoney } from './moneyColumn';
import { validateBankStatement } from './bankStatementRules';
import { checkStatementBalances } from './bankBalanceCheck';

const coffee = { date: '2026-11-05', counterparty: 'COSTA COFFEE', amount: -3.45 };

describe('validateSignedMoney', () => {
	it('keeps money in above zero and money out below, written as a number or as text', () => {
		expect(validateSignedMoney('amount', 250)).toBe(250);
		expect(validateSignedMoney('amount', -12.99)).toBe(-12.99);
		expect(validateSignedMoney('amount', '-12.99')).toBe(-12.99);
		expect(validateSignedMoney('amount', '0.50')).toBe(0.5);
	});

	it('refuses a third decimal place on either side of zero, and what is not an amount', () => {
		expect(validateSignedMoney('amount', -1.005)).toBe('amount has at most 2 decimal places; -1.005 was given.');
		expect(validateSignedMoney('amount', 1.005)).toBe('amount has at most 2 decimal places; 1.005 was given.');
		for (const candidate of ['--1', '-', 'ten', null, undefined]) {
			expect(validateSignedMoney('amount', candidate)).toBe('amount is an amount in pounds, such as 120.50 or -12.99.');
		}
	});
});

describe('validateBankStatement', () => {
	it('places each line in the statement and counts identical lines on one day', () => {
		const placed = validateBankStatement([coffee, coffee, { ...coffee, date: '2026-11-06' }]);
		expect(placed).toEqual([
			{ ...coffee, reference: '', kind: '', balanceAfter: null, position: 1, occurrence: 1 },
			{ ...coffee, reference: '', kind: '', balanceAfter: null, position: 2, occurrence: 2 },
			{ ...coffee, date: '2026-11-06', reference: '', kind: '', balanceAfter: null, position: 3, occurrence: 1 }
		]);
	});

	it('refuses by line number and field, never trimming or filling in', () => {
		expect(validateBankStatement([{ ...coffee, counterparty: ' ' }])).toContain('Line 1: counterparty is needed');
		expect(validateBankStatement([coffee, { ...coffee, kind: 'K'.repeat(61) }])).toBe('Line 2: kind is at most 60 characters; 61 were given.');
		expect(validateBankStatement([{ ...coffee, reference: 7 }])).toBe('Line 1: reference is text; 7 was given.');
		expect(validateBankStatement([{ ...coffee, date: '2026-02-30' }])).toContain('Line 1: date is not a day on the calendar');
		expect(validateBankStatement(['coffee'])).toContain('Line 1: each line is an object');
		expect(validateBankStatement(Array(501).fill(coffee))).toContain('501 were given');
	});
});

describe('checkStatementBalances', () => {
	it('checks each balance against the one above it and the line amount, to the penny', () => {
		const lines = [
			{ ...coffee, reference: '', kind: '', balanceAfter: 0.1 },
			{ ...coffee, reference: '', kind: '', amount: 0.2, balanceAfter: 0.3 },
			{ ...coffee, reference: '', kind: '', balanceAfter: null }
		];
		expect(checkStatementBalances(lines)).toEqual({ checkedCount: 1, disagreement: null });
	});
});
