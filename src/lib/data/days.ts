const millisecondsPerDay = 86_400_000;
const isoDayPattern = /^\d{4}-\d{2}-\d{2}$/;

/** A day as the register and the watchers write it: YYYY-MM-DD, in UTC. */
export function dayOf(milliseconds: number): string {
	return new Date(milliseconds).toISOString().slice(0, 10);
}

export function daysAgo(days: number, now: number = Date.now()): string {
	return dayOf(now - days * millisecondsPerDay);
}

/** A day as someone sent it: the day itself when it is a real one written YYYY-MM-DD, null when nothing was sent, undefined when it is not a day. */
export function readDay(value: unknown): string | null | undefined {
	const text = String(value ?? '').trim();
	if (text === '') return null;
	if (!isoDayPattern.test(text)) return undefined;
	const day = new Date(`${text}T00:00:00Z`);
	const isRealDay = !Number.isNaN(day.getTime()) && day.toISOString().startsWith(text);
	return isRealDay ? text : undefined;
}
