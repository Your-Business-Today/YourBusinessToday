const millisecondsPerDay = 86_400_000;

/** A day as the register and the watchers write it: YYYY-MM-DD, in UTC. */
export function dayOf(milliseconds: number): string {
	return new Date(milliseconds).toISOString().slice(0, 10);
}

export function daysAgo(days: number, now: number = Date.now()): string {
	return dayOf(now - days * millisecondsPerDay);
}
