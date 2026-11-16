import { describe, expect, it } from 'vitest';
import { isInstantWithZone } from './instantWithZone';

describe('isInstantWithZone', () => {
	it('takes a moment with its time zone, in UTC or an offset', () => {
		expect(isInstantWithZone('2026-11-16T09:30:00Z')).toBe(true);
		expect(isInstantWithZone('2026-11-16T09:30:00.123+01:00')).toBe(true);
		expect(isInstantWithZone('2026-11-16T09:30Z')).toBe(true);
	});

	it('refuses a moment with no time zone, a day alone and a day not on the calendar', () => {
		expect(isInstantWithZone('2026-11-16T09:30:00')).toBe(false);
		expect(isInstantWithZone('2026-11-16')).toBe(false);
		expect(isInstantWithZone('2026-02-30T09:30:00Z')).toBe(false);
	});
});
