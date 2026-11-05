const millisecondsPerDay = 86_400_000;

/** How many whole days have passed since a moment, never fewer than none. */
export function wholeDaysSince(moment: string, now: Date): number {
	const elapsed = now.getTime() - Date.parse(moment);
	return Math.max(0, Math.floor(elapsed / millisecondsPerDay));
}

/** Whether a moment falls within the last so many days. */
export function isWithinDays(moment: string | null, days: number, now: Date): boolean {
	if (moment === null) return false;
	return wholeDaysSince(moment, now) < days;
}

/** How long something has waited, in words: "under a day", "one day", "3 days". */
export function waitedFor(days: number): string {
	if (days === 0) return 'under a day';
	if (days === 1) return 'one day';
	return `${days} days`;
}
