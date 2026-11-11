import { describe, expect, it } from 'vitest';
import { addMonths, addWeeks, isSameMonth, monthTitleOf, monthWeeksOf, weekOf, weekStartOf } from './calendarDays';

describe('calendar days', () => {
	it('starts a week on its Monday, a Sunday belonging to the week before it', () => {
		expect(weekStartOf('2026-11-11')).toBe('2026-11-09');
		expect(weekStartOf('2026-11-15')).toBe('2026-11-09');
		expect(weekStartOf('2026-11-16')).toBe('2026-11-16');
	});

	it('lays out a week Monday to Sunday across the end of a month', () => {
		expect(weekOf('2026-12-01')).toEqual([
			'2026-11-30',
			'2026-12-01',
			'2026-12-02',
			'2026-12-03',
			'2026-12-04',
			'2026-12-05',
			'2026-12-06'
		]);
	});

	it('covers a month with the whole weeks that hold its days', () => {
		const weeks = monthWeeksOf('2026-11-20');
		expect(weeks).toHaveLength(6);
		expect(weeks[0][0]).toBe('2026-10-26');
		expect(weeks.at(-1)?.at(-1)).toBe('2026-12-06');
	});

	it('steps a month from any day to the first of the month, past the end of a long month', () => {
		expect(addMonths('2027-01-31', 1)).toBe('2027-02-01');
		expect(addMonths('2027-01-31', -1)).toBe('2026-12-01');
	});

	it('steps a week across the clocks going back', () => {
		expect(addWeeks('2026-10-21', 1)).toBe('2026-10-28');
	});

	it('names the month and knows which days share it', () => {
		expect(monthTitleOf('2026-11-11')).toBe('November 2026');
		expect(isSameMonth('2026-11-01', '2026-11-30')).toBe(true);
		expect(isSameMonth('2026-11-30', '2026-12-01')).toBe(false);
	});
});
