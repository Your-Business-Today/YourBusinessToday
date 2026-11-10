import type { PlanDay, PlanEntry, PlanWeek } from './contentPlan';

/** One line of a week's table: a piece on its day, or a day with nothing on it. The day is named once, on its first line. */
const firstOfDay = 0;

export type PlanRow = { key: string; dayLabel: string; entry: PlanEntry | null };

export function planRowsOf(week: PlanWeek): PlanRow[] {
	return week.days.flatMap(rowsOfDay);
}

function rowsOfDay(day: PlanDay): PlanRow[] {
	if (day.isEmpty) return [{ key: day.date, dayLabel: day.label, entry: null }];
	return day.entries.map((entry, index) => ({
		key: entry.id,
		dayLabel: index === firstOfDay ? day.label : '',
		entry
	}));
}
