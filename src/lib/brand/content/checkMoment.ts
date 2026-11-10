export type MomentCheck = { moment: string } | { problem: string };

const isoDateTimeWithZone = /^(\d{4})-(\d{2})-(\d{2})T\d{2}:\d{2}(:\d{2}(\.\d{1,6})?)?(Z|[+-]\d{2}:\d{2})$/;
const monthsCountFromZero = 1;
const example = 'such as 2026-12-01T09:00:00Z';

/** A moment given to the named field as an ISO date and time with its zone, kept as UTC, or why it cannot be kept. */
export function checkMoment(field: string, given: unknown): MomentCheck {
	const moment = typeof given === 'string' ? given.trim() : '';
	const parts = isoDateTimeWithZone.exec(moment);
	if (parts === null) return { problem: `${field} is an ISO date and time with its zone, ${example}` };
	const [, year, month, day] = parts.map(Number);
	const when = Date.parse(moment);
	if (Number.isNaN(when) || !isCalendarDay(year, month, day)) {
		return { problem: `${field} ${moment} is not a time on the calendar; give one ${example}` };
	}
	return { moment: new Date(when).toISOString() };
}

function isCalendarDay(year: number, month: number, day: number): boolean {
	const calendarDay = new Date(Date.UTC(year, month - monthsCountFromZero, day));
	const isSameMonth = calendarDay.getUTCMonth() === month - monthsCountFromZero;
	return isSameMonth && calendarDay.getUTCDate() === day;
}
