import { afterEach, describe, expect, it, vi } from 'vitest';
import { millisecondsUntilCallsAllowed, noteRateWindow, RateBudgetSpent, readRateWindow, stoppingCallsAt, waitBeforeNextCall, waitForRateBudget } from './rateBudget';

const millisecondsPerSecond = 1000;

function windowHeaders(remaining: number, resetsInSeconds: number): Headers {
	const resetsAtSeconds = Math.ceil(Date.now() / millisecondsPerSecond) + resetsInSeconds;
	return new Headers({ 'X-Ratelimit-Remain': String(remaining), 'X-Ratelimit-Reset': String(resetsAtSeconds) });
}

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

describe('work that has to stop by a moment', () => {
	afterEach(() => {
		vi.useRealTimers();
		noteRateWindow(windowHeaders(599, 300));
	});

	it('is refused, at once, a call that would wait for the window past that moment', async () => {
		noteRateWindow(windowHeaders(0, 200));
		const stopAt = Date.now() + 100_000;
		await expect(stoppingCallsAt(stopAt, waitForRateBudget)).rejects.toBeInstanceOf(RateBudgetSpent);
		expect(millisecondsUntilCallsAllowed()).toBeGreaterThan(100_000);
	});

	it('waits for a window that reopens before that moment, and then calls', async () => {
		vi.useFakeTimers();
		noteRateWindow(windowHeaders(0, 30));
		const waited = stoppingCallsAt(Date.now() + 100_000, waitForRateBudget);
		await vi.advanceTimersByTimeAsync(31_000);
		await expect(waited).resolves.toBeUndefined();
		expect(millisecondsUntilCallsAllowed()).toBe(0);
	});

	it('leaves work that named no moment to wait as long as the window takes', async () => {
		vi.useFakeTimers();
		noteRateWindow(windowHeaders(0, 200));
		const waited = waitForRateBudget();
		await vi.advanceTimersByTimeAsync(201_000);
		await expect(waited).resolves.toBeUndefined();
	});
});
