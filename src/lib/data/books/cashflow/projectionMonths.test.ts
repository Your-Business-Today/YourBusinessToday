import { describe, expect, it } from 'vitest';
import { projectionMonthsTo } from './projectionMonths';

describe('projectionMonthsTo', () => {
	it('runs from the month after this one to the month asked for', () => {
		expect(projectionMonthsTo('2026-11', '2027-02')).toEqual(['2026-12', '2027-01', '2027-02']);
	});

	it('runs to the end of the twelve-month forecast when no month is asked for', () => {
		const months = projectionMonthsTo('2026-11', undefined) as string[];
		expect([months[0], months.at(-1), months.length]).toEqual(['2026-12', '2027-10', 11]);
	});

	it('refuses this month, a month gone, one too far ahead and one that is not a month', () => {
		expect(projectionMonthsTo('2026-11', '2026-11')).toMatch(/^byMonth is a month after 2026-11/);
		expect(projectionMonthsTo('2026-11', '2032-01')).toMatch(/at most 60 months ahead/);
		expect(projectionMonthsTo('2026-11', 'March')).toMatch(/^byMonth is a month written as/);
	});
});
