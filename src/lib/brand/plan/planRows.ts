import type { PlanDay, PlanEntry, PlanWeek } from './contentPlan';

/** The day is named once, on its first line. */
const firstOfDay = 0;

/**
 * A line of a week's table: a piece on its day, a day with nothing on it, or a post the rhythm wants on the day and lacks.
 * `dueFor` names the mediums whose rhythm wants the post.
 */
export type PlanRow = { key: string; dayLabel: string; entry: PlanEntry | null; dueFor: string | null };

export function planRowsOf(week: PlanWeek): PlanRow[] {
	return week.days.flatMap(rowsOfDay);
}

function rowsOfDay(day: PlanDay): PlanRow[] {
	const dueFor = dueForOf(day.awaitedOn);
	if (day.isEmpty) return [{ key: day.date, dayLabel: day.label, entry: null, dueFor }];
	const entryRows = day.entries.map((entry, index) => ({
		key: entry.id,
		dayLabel: index === firstOfDay ? day.label : '',
		entry,
		dueFor: null
	}));
	if (dueFor === null) return entryRows;
	return [...entryRows, { key: `${day.date}-due`, dayLabel: '', entry: null, dueFor }];
}

function dueForOf(awaitedOn: string[]): string | null {
	if (awaitedOn.length === 0) return null;
	return awaitedOn.join(', ');
}
