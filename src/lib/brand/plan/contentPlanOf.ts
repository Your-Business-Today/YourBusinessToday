import { ContentStages, type PlannedPiece } from '../content/contentPiece';
import { mediumLabelOf } from '../projections/contentPiecePage';
import { monthAfter, monthBefore, planMonthKeyOf, planMonthLabelOf, type PlanMonth } from './planMonth';
import { planCountsOf } from './planCounts';
import { ukClockAt } from '$lib/data/ukClock';
import { weeksOfMonth, type PlanDayDate } from './planDays';
import type { ContentPlan, PlanDay, PlanEntry, PlanWeek } from './contentPlan';

const nothingOnIt = 0;

/** The month's plan from the brand's pieces: each on the day it goes out, the days with nothing on them left showing. */
export function contentPlanOf(month: PlanMonth, pieces: PlannedPiece[]): ContentPlan {
	const monthKey = planMonthKeyOf(month);
	const entries = pieces
		.map(entryOf)
		.filter((entry): entry is PlanEntry => entry !== null && entry.date.startsWith(monthKey))
		.sort((first, second) => `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`));
	return {
		monthKey,
		monthLabel: planMonthLabelOf(month),
		previousMonthKey: planMonthKeyOf(monthBefore(month)),
		nextMonthKey: planMonthKeyOf(monthAfter(month)),
		counts: planCountsOf(entries),
		weeks: weeksOfMonth(month).map((days) => weekOf(days, entries))
	};
}

/** The day a piece goes out: the day it is scheduled for once it is, otherwise the day it is planned for. */
export function goesOutAtOf(piece: PlannedPiece): string | null {
	return piece.scheduledFor ?? piece.plannedFor;
}

function entryOf(piece: PlannedPiece): PlanEntry | null {
	const goesOutAt = goesOutAtOf(piece);
	if (goesOutAt === null) return null;
	const { date, time } = ukClockAt(new Date(goesOutAt));
	const { id, mediumPath, title, hook, stage } = piece;
	const canMove = stage !== ContentStages.published;
	return { id, date, time, mediumPath, medium: mediumLabelOf(mediumPath), title, hook, stage, canMove };
}

function weekOf(days: PlanDayDate[], entries: PlanEntry[]): PlanWeek {
	const plannedDays = days.map((day) => dayOf(day, entries));
	const entryCount = plannedDays.flatMap((day) => day.entries).length;
	const [firstDay] = days;
	return { key: firstDay.date, label: `Week of ${firstDay.label}`, days: plannedDays, entryCount };
}

function dayOf(day: PlanDayDate, entries: PlanEntry[]): PlanDay {
	const dayEntries = entries.filter((entry) => entry.date === day.date);
	return { ...day, entries: dayEntries, isEmpty: dayEntries.length === nothingOnIt };
}
