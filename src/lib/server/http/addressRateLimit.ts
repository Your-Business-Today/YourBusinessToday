export type AddressWindow = { allowance: number; windowMilliseconds: number };
export type AddressRateLimit = { isAllowedFrom(clientAddress: string): boolean };

const mostTrackedAddresses = 10_000;

// Bounds bursts from one address on a public endpoint. The record lives in
// the serverless instance, so it resets whenever the instance does — enough
// to stop a loop, not a substitute for a per-user limit in the database.
export function addressRateLimit(window: AddressWindow): AddressRateLimit {
	const attemptTimesByAddress = new Map<string, number[]>();

	function isAllowedFrom(clientAddress: string): boolean {
		const now = Date.now();
		forgetQuietAddressesWhenCrowded(attemptTimesByAddress, window, now);
		const knownTimes = attemptTimesByAddress.get(clientAddress) ?? [];
		const recentTimes = timesWithinWindow(knownTimes, window, now);
		if (recentTimes.length >= window.allowance) {
			attemptTimesByAddress.set(clientAddress, recentTimes);
			return false;
		}
		attemptTimesByAddress.set(clientAddress, [...recentTimes, now]);
		return true;
	}

	return { isAllowedFrom };
}

function timesWithinWindow(times: number[], window: AddressWindow, now: number): number[] {
	return times.filter((time) => now - time < window.windowMilliseconds);
}

function forgetQuietAddressesWhenCrowded(
	attemptTimesByAddress: Map<string, number[]>,
	window: AddressWindow,
	now: number
): void {
	if (attemptTimesByAddress.size < mostTrackedAddresses) return;
	for (const [address, times] of attemptTimesByAddress) {
		const recentTimes = timesWithinWindow(times, window, now);
		if (recentTimes.length === 0) attemptTimesByAddress.delete(address);
	}
}
