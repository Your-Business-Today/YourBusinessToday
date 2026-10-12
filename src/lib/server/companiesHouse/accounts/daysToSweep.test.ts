import { describe, expect, it } from 'vitest';
import { daysToSweep, isStillAwaited } from './daysToSweep';

describe('daysToSweep', () => {
	const today = new Date('2026-10-12T06:20:00Z');

	it('runs from the day after the last swept day up to yesterday', () => {
		expect(daysToSweep('2026-10-09', today)).toEqual(['2026-10-10', '2026-10-11']);
		expect(daysToSweep('2026-10-11', today)).toEqual([]);
	});

	it('looks a week back on the first run', () => {
		expect(daysToSweep('', today)).toEqual(['2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08', '2026-10-09', '2026-10-10', '2026-10-11']);
	});

	it('still awaits a file for the last two days and gives up on older ones', () => {
		expect(isStillAwaited('2026-10-11', today)).toBe(true);
		expect(isStillAwaited('2026-10-10', today)).toBe(true);
		expect(isStillAwaited('2026-10-09', today)).toBe(false);
	});
});
