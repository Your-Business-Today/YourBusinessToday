const londonTimeZone = 'Europe/London';

const londonClock = new Intl.DateTimeFormat('en-GB', {
	timeZone: londonTimeZone,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit',
	hour: '2-digit',
	minute: '2-digit',
	hourCycle: 'h23'
});

/** A moment read on a UK clock: the calendar date as YYYY-MM-DD and the time of day as HH:MM. */
export type UkClock = { date: string; time: string };

export function ukClockAt(moment: Date): UkClock {
	const parts = new Map(londonClock.formatToParts(moment).map((part) => [part.type, part.value]));
	const date = `${parts.get('year')}-${parts.get('month')}-${parts.get('day')}`;
	const time = `${parts.get('hour')}:${parts.get('minute')}`;
	return { date, time };
}
