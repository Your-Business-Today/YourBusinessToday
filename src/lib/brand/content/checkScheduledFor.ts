export type ScheduledForCheck = { scheduledFor: string } | { problem: string };

const isoDateTimeWithZone = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})$/;
const monthsCountFromZero = 1;
const example = 'such as 2026-12-01T09:00:00Z';

/** When the piece goes out, as an ISO date and time with its zone, or why it cannot be kept. */
export function checkScheduledFor(given: unknown): ScheduledForCheck {
	const scheduledFor = typeof given === 'string' ? given.trim() : '';
	const parts = isoDateTimeWithZone.exec(scheduledFor);
	if (parts === null)
		return {
			problem: `scheduledFor is an ISO date and time with its zone, ${example}`
		};
	const [, year, month, day] = parts.map(Number);
	const when = Date.parse(scheduledFor);
	if (Number.isNaN(when) || !isCalendarDay(year, month, day)) {
		return {
			problem: `scheduledFor ${scheduledFor} is not a time on the calendar; give one ${example}`
		};
	}
	return { scheduledFor: new Date(when).toISOString() };
}

function isCalendarDay(year: number, month: number, day: number): boolean {
	const calendarDay = new Date(Date.UTC(year, month - monthsCountFromZero, day));
	const isSameMonth = calendarDay.getUTCMonth() === month - monthsCountFromZero;
	return isSameMonth && calendarDay.getUTCDate() === day;
}
