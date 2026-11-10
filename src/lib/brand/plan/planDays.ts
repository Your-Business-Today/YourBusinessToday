import { planMonthKeyOf, type PlanMonth } from './planMonth';

/** One day of the month's plan: its date on the UK clock as YYYY-MM-DD, and how a person reads it. */
export type PlanDayDate = { date: string; label: string };

const firstDay = 1;
const dayDigits = 2;
const monday = 1;
const midday = 'T12:00:00Z';
const dayBeforeTheFirst = 0;
const dayLabels = new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

/** Every day of the month, split into weeks that start on a Monday; the first and last weeks may be short. */
export function weeksOfMonth(month: PlanMonth): PlanDayDate[][] {
	const weeks: PlanDayDate[][] = [];
	for (const day of daysOfMonth(month)) {
		const isNewWeek = weeks.length === 0 || weekdayOf(day.date) === monday;
		if (isNewWeek) weeks.push([]);
		weeks[weeks.length - 1].push(day);
	}
	return weeks;
}

export function dayLabelOf(date: string): string {
	return dayLabels.format(new Date(`${date}${midday}`));
}

function daysOfMonth(month: PlanMonth): PlanDayDate[] {
	const nextMonthCountedFromZero = month.month;
	const lastDay = new Date(Date.UTC(month.year, nextMonthCountedFromZero, dayBeforeTheFirst));
	const dayCount = lastDay.getUTCDate();
	const monthKey = planMonthKeyOf(month);
	return Array.from({ length: dayCount }, (_, index) => {
		const date = `${monthKey}-${String(index + firstDay).padStart(dayDigits, '0')}`;
		return { date, label: dayLabelOf(date) };
	});
}

function weekdayOf(date: string): number {
	return new Date(`${date}${midday}`).getUTCDay();
}
