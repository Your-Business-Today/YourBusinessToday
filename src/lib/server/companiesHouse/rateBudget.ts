import { AsyncLocalStorage } from 'node:async_hooks';

/** What Companies House said about the window: how many calls remain and when the window resets, as epoch seconds. */
export type RateWindow = { remaining: number; resetsAtSeconds: number };

/** A call refused rather than made late: the window reopens only after the moment its caller has to be done by. */
export class RateBudgetSpent extends Error {
	constructor() {
		super('Companies House allows no more calls until after this work has to stop');
	}
}

const remainHeader = 'x-ratelimit-remain';
const resetHeader = 'x-ratelimit-reset';
const millisecondsPerSecond = 1000;
/** Calls kept back so a burst from the map never spends the last of the window. */
const reserve = 20;

let window: RateWindow | null = null;
const latestMomentToWaitUntil = new AsyncLocalStorage<number>();

export function readRateWindow(headers: Headers): RateWindow | null {
	const remaining = Number(headers.get(remainHeader));
	const resetsAtSeconds = Number(headers.get(resetHeader));
	if (Number.isNaN(remaining) || Number.isNaN(resetsAtSeconds) || headers.get(remainHeader) === null) return null;
	return { remaining, resetsAtSeconds };
}

/** How long to wait before the next call, given the last window seen: nothing while calls remain, else until the reset. */
export function waitBeforeNextCall(lastWindow: RateWindow | null, nowMilliseconds: number): number {
	if (lastWindow === null || lastWindow.remaining > reserve) return 0;
	return Math.max(0, lastWindow.resetsAtSeconds * millisecondsPerSecond - nowMilliseconds);
}

export function noteRateWindow(headers: Headers): void {
	const seen = readRateWindow(headers);
	if (seen !== null) window = seen;
}

/** How long the next keyed call would wait, as the last window seen stands now. */
export function millisecondsUntilCallsAllowed(): number {
	return waitBeforeNextCall(window, Date.now());
}

/**
 * Runs work that has to be done by the moment given: a keyed call inside it that would wait for the window past that
 * moment is refused as RateBudgetSpent, because a run the platform cuts off while it waits answers nobody.
 */
export function stoppingCallsAt<Result>(stopAtMilliseconds: number, work: () => Promise<Result>): Promise<Result> {
	return latestMomentToWaitUntil.run(stopAtMilliseconds, work);
}

/** Every keyed call waits here first, so the 600 calls in five minutes are never exceeded by any caller. */
export async function waitForRateBudget(): Promise<void> {
	const now = Date.now();
	const waitFor = waitBeforeNextCall(window, now);
	if (waitFor === 0) return;
	const stopAt = latestMomentToWaitUntil.getStore() ?? Number.POSITIVE_INFINITY;
	if (now + waitFor > stopAt) throw new RateBudgetSpent();
	await new Promise((resolve) => setTimeout(resolve, waitFor));
	window = null;
}
