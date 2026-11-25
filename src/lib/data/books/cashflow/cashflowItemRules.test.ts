import { describe, expect, it } from 'vitest';
import { validateCashflowItem } from './cashflowItemRules';
import { applyCashflowItemChange, nothingToChange } from './cashflowItemChangeRules';
import type { CashflowItem } from './cashflowItem';

const repayment = { title: 'Repayment to Jeremy', direction: 'out', amount: 400.76, repeats: 'monthly', firstMonth: '2026-12' };

describe('a new forecast item checked against its columns', () => {
	it('keeps the item as given, with no last month and no notes when left out', () => {
		expect(validateCashflowItem(repayment)).toEqual({ ...repayment, lastMonth: null, notes: '' });
	});

	it('refuses what the columns cannot hold, naming the field and the limit', () => {
		expect(validateCashflowItem({ ...repayment, title: 'x'.repeat(121) })).toBe('title is at most 120 characters; 121 were given.');
		expect(validateCashflowItem({ ...repayment, amount: 0 })).toContain('amount is above zero');
		expect(validateCashflowItem({ ...repayment, amount: 1.234 })).toBe('amount has at most 2 decimal places; 1.234 was given.');
		expect(validateCashflowItem({ ...repayment, direction: 'sideways' })).toBe('direction is one of in, out; "sideways" was given.');
		expect(validateCashflowItem({ ...repayment, firstMonth: '2026-12-01' })).toContain('firstMonth is a month written as 2026-11');
		expect(validateCashflowItem({ ...repayment, title: undefined })).toBe('title is needed; it was left out.');
	});

	it('refuses months that do not agree with how often the item comes round', () => {
		expect(validateCashflowItem({ ...repayment, lastMonth: '2026-11' })).toContain('lastMonth cannot come before firstMonth');
		expect(validateCashflowItem({ ...repayment, repeats: 'once', lastMonth: '2027-01' })).toContain('only for an item that repeats');
	});
});

describe('a change to a forecast item', () => {
	const held: CashflowItem = { ...(validateCashflowItem(repayment) as CashflowItem), id: 'item' };

	it('changes only what was given, and lets a last month be set or cleared', () => {
		expect(applyCashflowItemChange(held, { lastMonth: '2031-11' })).toEqual({ ...held, lastMonth: '2031-11' });
		expect(applyCashflowItemChange({ ...held, lastMonth: '2031-11' }, { lastMonth: null })).toEqual(held);
	});

	it('checks the months once merged, and refuses a change of nothing', () => {
		expect(applyCashflowItemChange(held, { firstMonth: '2027-06', lastMonth: '2027-01' })).toContain('cannot come before');
		expect(applyCashflowItemChange(held, {})).toBe(nothingToChange);
	});
});
