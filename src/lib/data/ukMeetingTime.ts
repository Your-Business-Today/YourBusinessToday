import { formatBritishDate } from './britishDate';
import { ukClockAt } from './ukClock';

/** The day a moment falls on by the UK clock: "12 Nov 2026". */
export function ukMeetingDay(moment: string): string {
	const clock = ukClockAt(new Date(moment));
	return formatBritishDate(`${clock.date}T12:00:00Z`);
}

/** A moment as the UK clock shows it, with the year: "12 Nov 2026 at 10:00". */
export function ukMeetingTime(moment: string): string {
	return `${ukMeetingDay(moment)} at ${ukClockAt(new Date(moment)).time}`;
}
