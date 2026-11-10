import { describe, expect, it } from 'vitest';
import { moneyColumnLimits, validateMoney, validateQuantity } from './moneyColumn';
import { formatPoundsAndPence, sumMoney } from './money';

describe('validateMoney', () => {
	it('accepts pounds and pence, written as a number or as text', () => {
		expect(validateMoney('debit', 120.5)).toBe(120.5);
		expect(validateMoney('debit', '120.50')).toBe(120.5);
		expect(validateMoney('debit', 0)).toBe(0);
		expect(validateMoney('debit', moneyColumnLimits.largest)).toBe(moneyColumnLimits.largest);
	});

	it('refuses an amount below zero rather than turning it round', () => {
		expect(validateMoney('debit', -1)).toBe('debit cannot be below zero; -1 was given.');
	});

	it('refuses a third decimal place rather than rounding it', () => {
		expect(validateMoney('credit', 1.005)).toBe('credit has at most 2 decimal places; 1.005 was given.');
		expect(validateMoney('credit', '1.005')).toBe('credit is an amount in pounds, such as 120.50.');
	});

	it('refuses an amount the column is too small to hold', () => {
		expect(validateMoney('credit', 10_000_000_000)).toMatch(/^credit is at most 9999999999.99/);
	});

	it('refuses what is not an amount', () => {
		for (const candidate of [Number.NaN, Number.POSITIVE_INFINITY, 'ten', '', null, true]) {
			expect(validateMoney('debit', candidate)).toBe('debit is an amount in pounds, such as 120.50.');
		}
	});
});

describe('sumMoney', () => {
	it('adds pence exactly, so 10p and 20p make 30p', () => {
		expect(sumMoney([0.1, 0.2])).toBe(0.3);
	});
});

describe('formatPoundsAndPence', () => {
	it('shows pounds to the penny, with the thousands marked and a minus below zero', () => {
		expect(formatPoundsAndPence(1234.5)).toBe('£1,234.50');
		expect(formatPoundsAndPence(-300.1)).toBe('-£300.10');
		expect(formatPoundsAndPence(0)).toBe('£0.00');
	});
});

describe('validateQuantity', () => {
	it('accepts a quantity above zero to two places, and refuses none, a third place or what is not a number', () => {
		expect(validateQuantity('Line 1 quantity', 1.5)).toBe(1.5);
		expect(validateQuantity('Line 1 quantity', 0)).toBe('Line 1 quantity is above zero; 0 was given.');
		expect(validateQuantity('Line 1 quantity', 1.005)).toBe('Line 1 quantity has at most 2 decimal places; 1.005 was given.');
		expect(validateQuantity('Line 1 quantity', 'two')).toBe('Line 1 quantity is a number, such as 2 or 1.5.');
	});
});
