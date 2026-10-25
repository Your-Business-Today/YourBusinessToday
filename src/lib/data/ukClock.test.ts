import { describe, expect, it } from 'vitest';
import { ukClockAt } from './ukClock';

describe('ukClockAt', () => {
	it('reads a summer moment an hour ahead of UTC', () => {
		expect(ukClockAt(new Date('2026-07-01T17:30:00Z'))).toEqual({ date: '2026-07-01', time: '18:30' });
	});

	it('reads a winter moment on UTC, and midnight as 00:00', () => {
		expect(ukClockAt(new Date('2026-12-01T18:30:00Z'))).toEqual({ date: '2026-12-01', time: '18:30' });
		expect(ukClockAt(new Date('2026-12-01T00:00:00Z'))).toEqual({ date: '2026-12-01', time: '00:00' });
	});

	it('rolls the date with the UK clock, not the UTC one', () => {
		expect(ukClockAt(new Date('2026-07-01T23:30:00Z'))).toEqual({ date: '2026-07-02', time: '00:30' });
	});
});
