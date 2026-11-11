/** A calendar's days, as YYYY-MM-DD dates, counted on the calendar alone so no clock change can shift a day. */

const daysInAWeek = 7;
const daysFromMondayOnSunday = 6;
const isoDateLength = 10;
const firstDayOfTheMonth = 1;

const monthTitle = new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' });
const dayTitle = new Intl.DateTimeFormat('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
const shortWeekday = new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'UTC' });

function calendarDateOf(date: string): Date {
	return new Date(`${date}T00:00:00Z`);
}

function isoDateOf(moment: Date): string {
	return moment.toISOString().slice(0, isoDateLength);
}

export function addDays(date: string, dayCount: number): string {
	const day = calendarDateOf(date);
	day.setUTCDate(day.getUTCDate() + dayCount);
	return isoDateOf(day);
}

export function addWeeks(date: string, weekCount: number): string {
	return addDays(date, weekCount * daysInAWeek);
}

/** The first of the month a given number of months on from the date's month. */
export function addMonths(date: string, monthCount: number): string {
	const day = calendarDateOf(date);
	day.setUTCDate(firstDayOfTheMonth);
	day.setUTCMonth(day.getUTCMonth() + monthCount);
	return isoDateOf(day);
}

/** The Monday that starts the week the date falls in, as weeks start on UK calendars. */
export function weekStartOf(date: string): string {
	const weekday = calendarDateOf(date).getUTCDay();
	const daysSinceMonday = (weekday + daysFromMondayOnSunday) % daysInAWeek;
	return addDays(date, -daysSinceMonday);
}

export function weekOf(date: string): string[] {
	const monday = weekStartOf(date);
	return Array.from({ length: daysInAWeek }, (_, dayIndex) => addDays(monday, dayIndex));
}

/** Every whole week that holds a day of the date's month, Monday to Sunday. */
export function monthWeeksOf(date: string): string[][] {
	const firstOfMonth = addMonths(date, 0);
	const firstOfNextMonth = addMonths(date, 1);
	const weeks: string[][] = [];
	for (let monday = weekStartOf(firstOfMonth); monday < firstOfNextMonth; monday = addWeeks(monday, 1)) {
		weeks.push(weekOf(monday));
	}
	return weeks;
}

export function isSameMonth(date: string, otherDate: string): boolean {
	return addMonths(date, 0) === addMonths(otherDate, 0);
}

export function dayOfMonthOf(date: string): number {
	return calendarDateOf(date).getUTCDate();
}

export function monthTitleOf(date: string): string {
	return monthTitle.format(calendarDateOf(date));
}

export function dayTitleOf(date: string): string {
	return dayTitle.format(calendarDateOf(date));
}

export function shortWeekdayOf(date: string): string {
	return shortWeekday.format(calendarDateOf(date));
}
