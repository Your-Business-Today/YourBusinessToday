const millisecondsPerDay = 24 * 60 * 60 * 1000;
const isoDateLength = 10;

export function isoDateOf(date: Date): string {
	return date.toISOString().slice(0, isoDateLength);
}

/** The calendar day a number of days from a day, negative for the past, as an ISO date. */
export function isoDateDaysFrom(isoDate: string, days: number): string {
	const moved = new Date(new Date(isoDate).getTime() + days * millisecondsPerDay);
	return isoDateOf(moved);
}

export function daysBetween(earlierIsoDate: string, laterIsoDate: string): number {
	const difference = new Date(laterIsoDate).getTime() - new Date(earlierIsoDate).getTime();
	return Math.round(difference / millisecondsPerDay);
}
