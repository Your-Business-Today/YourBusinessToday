import { describe, expect, it } from 'vitest';
import { validateIsoDate } from './isoDate';

describe('validateIsoDate', () => {
	it('accepts a real day written as 2026-11-30', () => {
		expect(validateIsoDate('journalDate', '2026-11-30')).toBeNull();
		expect(validateIsoDate('journalDate', '2028-02-29')).toBeNull();
	});

	it('refuses a day the calendar does not have rather than moving it', () => {
		expect(validateIsoDate('journalDate', '2026-02-30')).toBe('journalDate is not a day on the calendar; 2026-02-30 was given.');
	});

	it('refuses a date written any other way', () => {
		for (const candidate of ['30/11/2026', '2026-11-30T09:00:00Z', 20261130, undefined]) {
			expect(validateIsoDate('journalDate', candidate)).toBe('journalDate is a date written as 2026-11-30.');
		}
	});
});
