import { describe, expect, it } from 'vitest';
import { describeMonth, monthEnd, monthStart, shiftMonth, validateMonthKey } from './monthKey';

describe('a month of the books', () => {
	it('is a month written as 2026-11, and nothing else', () => {
		expect(validateMonthKey('monthKey', '2026-11')).toBeNull();
		expect(validateMonthKey('monthKey', '2026-13')).toBe('monthKey is a month written as 2026-11; "2026-13" was given.');
		expect(validateMonthKey('monthKey', '2026-11-30')).toContain('was given');
		expect(validateMonthKey('monthKey', 202611)).toBe('monthKey is a month written as 2026-11; 202611 was given.');
	});

	it('starts on the first and ends on its last day, February in a leap year included', () => {
		expect(monthStart('2026-11')).toBe('2026-11-01');
		expect(monthEnd('2026-11')).toBe('2026-11-30');
		expect(monthEnd('2028-02')).toBe('2028-02-29');
		expect(monthEnd('2026-12')).toBe('2026-12-31');
	});

	it('moves across the turn of a year, and reads as a person says it', () => {
		expect(shiftMonth('2026-12', 1)).toBe('2027-01');
		expect(shiftMonth('2026-11', 13)).toBe('2027-12');
		expect(describeMonth('2027-01')).toBe('January 2027');
	});
});
