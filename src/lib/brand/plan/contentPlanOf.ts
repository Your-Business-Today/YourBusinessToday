import { ContentStages, type PlannedPiece } from '../content/contentPiece';
import { mediumLabelOf } from '../projections/contentPiecePage';
import { monthAfter, monthBefore, planMonthKeyOf, planMonthLabelOf, type PlanMonth } from './planMonth';
import { kindCountsOf, planCountsOf } from './planCounts';
import { ukClockAt } from '$lib/data/ukClock';
import { weeksOfMonth, type PlanDayDate } from './planDays';
import { awaitedOnOf, isOutsideRhythm, rhythmTalliesOf } from './planRhythm';
import type { PostingRhythm } from '../rhythm/postingRhythm';
import type { ContentPlan, PlanDay, PlanEntry, PlanWeek } from './contentPlan';

const nothingOnIt = 0;

/**
 * The month's plan from the brand's pieces: each on the day it goes out, the days with nothing on them left showing,
 * and each week held against the brand's posting rhythms.
 */
export function contentPlanOf(month: PlanMonth, pieces: PlannedPiece[], rhythms: PostingRhythm[] = []): ContentPlan {
	const monthKey = planMonthKeyOf(month);
	const entries = pieces
		.map((piece) => entryOf(piece, rhythms))
		.filter((entry): entry is PlanEntry => entry !== null && entry.date.startsWith(monthKey))
		.sort((first, second) => `${first.date}${first.time}`.localeCompare(`${second.date}${second.time}`));
	return {
		monthKey,
		monthLabel: planMonthLabelOf(month),
		previousMonthKey: planMonthKeyOf(monthBefore(month)),
		nextMonthKey: planMonthKeyOf(monthAfter(month)),
		counts: planCountsOf(entries),
		kindCounts: kindCountsOf(entries),
		rhythms,
		weeks: weeksOfMonth(month).map((days) => weekOf(days, entries, rhythms))
	};
}

/** The day a piece goes out: the day it is scheduled for once it is, otherwise the day it is planned for. */
export function goesOutAtOf(piece: PlannedPiece): string | null {
	return piece.scheduledFor ?? piece.plannedFor;
}

function entryOf(piece: PlannedPiece, rhythms: PostingRhythm[]): PlanEntry | null {
	const goesOutAt = goesOutAtOf(piece);
	if (goesOutAt === null) return null;
	const { date, time } = ukClockAt(new Date(goesOutAt));
	const { id, mediumPath, kind, title, hook, stage } = piece;
	const canMove = stage !== ContentStages.published;
	const isExtra = isOutsideRhythm(rhythms, { date, mediumPath });
	return { id, date, time, mediumPath, medium: mediumLabelOf(mediumPath), kind, title, hook, stage, canMove, isExtra };
}

function weekOf(days: PlanDayDate[], entries: PlanEntry[], rhythms: PostingRhythm[]): PlanWeek {
	const weekEntries = entries.filter((entry) => days.some((day) => day.date === entry.date));
	const tallies = rhythmTalliesOf(rhythms, days, weekEntries);
	const plannedDays = days.map((day) => dayOf(day, weekEntries, awaitedOnOf(rhythms, tallies, day, weekEntries)));
	const [firstDay] = days;
	return { key: firstDay.date, label: `Week of ${firstDay.label}`, days: plannedDays, entryCount: weekEntries.length, tallies };
}

function dayOf(day: PlanDayDate, entries: PlanEntry[], awaitedOn: string[]): PlanDay {
	const dayEntries = entries.filter((entry) => entry.date === day.date);
	return { ...day, entries: dayEntries, isEmpty: dayEntries.length === nothingOnIt, awaitedOn };
}
