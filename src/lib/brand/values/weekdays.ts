/** The days of the week in the order the plan's weeks run, Monday first. */
export const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export type Weekday = (typeof weekdays)[number];

const mondayCountedFromSunday = 1;
const daysInWeek = weekdays.length;
const midday = 'T12:00:00Z';

/** The weekday a name gives, whatever its capitals, or null for a name that is not one. */
export function weekdayNamed(name: string): Weekday | null {
	const asked = name.trim().toLowerCase();
	return weekdays.find((weekday) => weekday.toLowerCase() === asked) ?? null;
}

/** The weekday a calendar date as YYYY-MM-DD falls on. */
export function weekdayOfDate(date: string): Weekday {
	const dayCountedFromSunday = new Date(`${date}${midday}`).getUTCDay();
	const dayCountedFromMonday = (dayCountedFromSunday + daysInWeek - mondayCountedFromSunday) % daysInWeek;
	return weekdays[dayCountedFromMonday];
}
