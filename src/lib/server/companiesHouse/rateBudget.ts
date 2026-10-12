/** What Companies House said about the window: how many calls remain and when the window resets, as epoch seconds. */
export type RateWindow = { remaining: number; resetsAtSeconds: number };

const remainHeader = 'x-ratelimit-remain';
const resetHeader = 'x-ratelimit-reset';
const millisecondsPerSecond = 1000;
/** Calls kept back so a burst from the map never spends the last of the window. */
const reserve = 20;

let window: RateWindow | null = null;

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

/** Every keyed call waits here first, so the 600 calls in five minutes are never exceeded by any caller. */
export async function waitForRateBudget(): Promise<void> {
	const waitFor = waitBeforeNextCall(window, Date.now());
	if (waitFor === 0) return;
	await new Promise((resolve) => setTimeout(resolve, waitFor));
	window = null;
}
