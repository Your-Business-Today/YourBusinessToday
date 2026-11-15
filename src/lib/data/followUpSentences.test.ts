import { describe, expect, it } from 'vitest';
import { daysBetween } from './days';
import { describeDueDay, isOverdue } from './followUpSentences';

const today = '2026-11-15';

describe('when a next step falls', () => {
	it('counts the days from one day to a later one, across a month end and backwards', () => {
		expect(daysBetween('2026-11-12', today)).toBe(3);
		expect(daysBetween('2026-10-31', '2026-11-01')).toBe(1);
		expect(daysBetween('2026-11-20', today)).toBe(-5);
		expect(daysBetween(today, today)).toBe(0);
	});

	it('says due today for today, and is not overdue until the day has passed', () => {
		expect(describeDueDay(today, today)).toBe('due today');
		expect(isOverdue(today, today)).toBe(false);
	});

	it('says how many days a past day is overdue, one day in the singular', () => {
		expect(describeDueDay('2026-11-12', today)).toBe('due 12 Nov 2026, 3 days overdue');
		expect(describeDueDay('2026-11-14', today)).toBe('due 14 Nov 2026, 1 day overdue');
		expect(isOverdue('2026-11-14', today)).toBe(true);
	});

	it('gives only the day for one still to come', () => {
		expect(describeDueDay('2026-11-20', today)).toBe('due 20 Nov 2026');
		expect(isOverdue('2026-11-20', today)).toBe(false);
	});
});
