import { describe, expect, it } from 'vitest';
import { firstPeriodDayRefusal, firstPeriodPairRefusal, firstPeriodRefusal } from './firstPeriodRules';

const augustYearStart = 8;

describe('a first accounting period', () => {
	it('keeps a period from the day the company was formed to the day before a year starts', () => {
		expect(firstPeriodRefusal({ start: '2026-07-09', end: '2027-07-31' }, augustYearStart)).toBeNull();
		expect(firstPeriodRefusal({ start: '2026-08-01', end: '2027-07-31' }, augustYearStart)).toBeNull();
	});

	it('refuses an end before the start', () => {
		expect(firstPeriodRefusal({ start: '2026-07-09', end: '2025-07-31' }, augustYearStart)).toBe(
			'firstPeriodEnd (2025-07-31) is before firstPeriodStart (2026-07-09).'
		);
	});

	it('refuses a period longer than 18 months, by the day', () => {
		expect(firstPeriodRefusal({ start: '2026-02-01', end: '2027-07-31' }, augustYearStart)).toBeNull();
		expect(firstPeriodRefusal({ start: '2026-01-31', end: '2027-07-31' }, augustYearStart)).toBe(
			'A first period runs at most 18 months; 2026-01-31 to 2027-07-31 is longer.'
		);
		expect(firstPeriodRefusal({ start: '2026-08-31', end: '2028-02-29' }, 3)).toBe(
			'A first period runs at most 18 months; 2026-08-31 to 2028-02-29 is longer.'
		);
	});

	it('refuses an end that is not the day before the financial year starts', () => {
		expect(firstPeriodRefusal({ start: '2026-07-09', end: '2027-06-30' }, augustYearStart)).toBe(
			'firstPeriodEnd is the day before a financial year starts: the last day of July, as the year starts in August; ' +
				'2027-06-30 was given.'
		);
		expect(firstPeriodRefusal({ start: '2026-07-09', end: '2027-07-30' }, 1)).toMatch(/the last day of December, as the year starts in January/);
	});
});

describe('the first period as given', () => {
	it('takes a real day or null, nothing else', () => {
		expect(firstPeriodDayRefusal('firstPeriodStart', null)).toBeNull();
		expect(firstPeriodDayRefusal('firstPeriodStart', '2026-07-09')).toBeNull();
		expect(firstPeriodDayRefusal('firstPeriodStart', '09/07/2026')).toBe('firstPeriodStart is a date written as 2026-11-30.');
		expect(firstPeriodDayRefusal('firstPeriodEnd', '2027-02-30')).toBe('firstPeriodEnd is not a day on the calendar; 2027-02-30 was given.');
	});

	it('gives the two days together and clears them together', () => {
		expect(firstPeriodPairRefusal(undefined, undefined)).toBeNull();
		expect(firstPeriodPairRefusal('2026-07-09', '2027-07-31')).toBeNull();
		expect(firstPeriodPairRefusal(null, null)).toBeNull();
		expect(firstPeriodPairRefusal('2026-07-09', undefined)).toBe('firstPeriodStart and firstPeriodEnd are given together, or both left out.');
		expect(firstPeriodPairRefusal(undefined, '2027-07-31')).toBe('firstPeriodStart and firstPeriodEnd are given together, or both left out.');
		expect(firstPeriodPairRefusal(null, '2027-07-31')).toBe('firstPeriodStart and firstPeriodEnd are cleared together, both as null.');
	});
});
