import { describe, expect, it } from 'vitest';
import { booksPagePeriod } from './booksPagePeriod';

const aprilYearStart = { startMonth: 4, firstPeriod: null };
const today = '2026-11-10';

describe('booksPagePeriod', () => {
	it('opens on the financial year to today when no days are asked for', () => {
		const nothingAsked = { periodStart: null, periodEnd: null };
		expect(booksPagePeriod(nothingAsked, today, aprilYearStart)).toEqual({ start: '2026-04-01', end: today, yearStart: '2026-04-01' });
	});

	it('starts a last day asked for on the first day of its own financial year', () => {
		const endAsked = { periodStart: null, periodEnd: '2026-03-31' };
		expect(booksPagePeriod(endAsked, today, aprilYearStart)).toEqual({ start: '2025-04-01', end: '2026-03-31', yearStart: '2025-04-01' });
	});

	it("opens a new company's page on its first accounting period's first day", () => {
		const firstAccounts = { startMonth: 8, firstPeriod: { start: '2026-07-09', end: '2027-07-31' } };
		const nothingAsked = { periodStart: null, periodEnd: null };
		expect(booksPagePeriod(nothingAsked, today, firstAccounts)).toEqual({ start: '2026-07-09', end: today, yearStart: '2026-07-09' });
	});

	it('refuses days that are not real or not in order, naming the field', () => {
		expect(booksPagePeriod({ periodStart: null, periodEnd: '2026-02-30' }, today, aprilYearStart)).toMatch(/^periodEnd/);
		expect(booksPagePeriod({ periodStart: '2026-07-01', periodEnd: '2026-06-30' }, today, aprilYearStart)).toMatch(/after periodEnd/);
	});
});
