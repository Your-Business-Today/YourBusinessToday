import { describe, expect, it } from 'vitest';
import { financialYearStart, isDayBeforeYearStart } from './financialYear';

const augustYearStart = 8;
const firstAccounts = { start: '2026-07-09', end: '2027-07-31' };
const yourBusinessToday = { startMonth: augustYearStart, firstPeriod: firstAccounts };
const noFirstPeriod = { startMonth: augustYearStart, firstPeriod: null };

describe('financialYearStart', () => {
	it('starts every day of the first period on its first day, the days before the start month included', () => {
		expect(financialYearStart('2026-07-20', yourBusinessToday)).toBe('2026-07-09');
		expect(financialYearStart('2026-11-10', yourBusinessToday)).toBe('2026-07-09');
		expect(financialYearStart('2027-07-31', yourBusinessToday)).toBe('2026-07-09');
	});

	it('runs from the start month again from the day after the first period ends', () => {
		expect(financialYearStart('2027-08-01', yourBusinessToday)).toBe('2027-08-01');
		expect(financialYearStart('2027-09-15', yourBusinessToday)).toBe('2027-08-01');
		expect(financialYearStart('2028-07-31', yourBusinessToday)).toBe('2027-08-01');
	});

	it('reads as before for books with no first period', () => {
		expect(financialYearStart('2026-11-10', noFirstPeriod)).toBe('2026-08-01');
		expect(financialYearStart('2026-07-20', noFirstPeriod)).toBe('2025-08-01');
		expect(financialYearStart('2026-11-10', { startMonth: 1, firstPeriod: null })).toBe('2026-01-01');
	});
});

describe('isDayBeforeYearStart', () => {
	it('is the last day of the month before the start month, across a new year too', () => {
		expect(isDayBeforeYearStart('2027-07-31', augustYearStart)).toBe(true);
		expect(isDayBeforeYearStart('2027-12-31', 1)).toBe(true);
		expect(isDayBeforeYearStart('2028-02-29', 3)).toBe(true);
	});

	it('is no other day', () => {
		expect(isDayBeforeYearStart('2027-07-30', augustYearStart)).toBe(false);
		expect(isDayBeforeYearStart('2027-06-30', augustYearStart)).toBe(false);
		expect(isDayBeforeYearStart('2027-08-01', augustYearStart)).toBe(false);
	});
});
