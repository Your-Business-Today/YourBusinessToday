export const londonTimeZone = 'Europe/London';

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

function asIfUtc(clock: UkClock): number {
	return new Date(`${clock.date}T${clock.time}:00Z`).getTime();
}

/** The moment a UK clock shows the given date and time, or null when the clocks going forward skip it. */
export function momentOnUkClock(clock: UkClock): Date | null {
	const guess = asIfUtc(clock);
	const ukOffset = asIfUtc(ukClockAt(new Date(guess))) - guess;
	const moment = new Date(guess - ukOffset);
	const shown = ukClockAt(moment);
	const isShownAsGiven = shown.date === clock.date && shown.time === clock.time;
	return isShownAsGiven ? moment : null;
}
