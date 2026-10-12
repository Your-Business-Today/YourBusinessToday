import { describe, expect, it } from 'vitest';
import { readRateWindow, waitBeforeNextCall } from './rateBudget';

describe('rateBudget', () => {
	it('reads the window from the headers and ignores an answer without them', () => {
		expect(readRateWindow(new Headers({ 'X-Ratelimit-Remain': '599', 'X-Ratelimit-Reset': '1791800000' }))).toEqual({ remaining: 599, resetsAtSeconds: 1791800000 });
		expect(readRateWindow(new Headers())).toBeNull();
	});

	it('waits nothing while calls remain and until the reset once the reserve is reached', () => {
		const now = 1791799990 * 1000;
		expect(waitBeforeNextCall({ remaining: 400, resetsAtSeconds: 1791800000 }, now)).toBe(0);
		expect(waitBeforeNextCall({ remaining: 3, resetsAtSeconds: 1791800000 }, now)).toBe(10_000);
		expect(waitBeforeNextCall({ remaining: 0, resetsAtSeconds: 1791799000 }, now)).toBe(0);
		expect(waitBeforeNextCall(null, now)).toBe(0);
	});
});
