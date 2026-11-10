import { ContentStages, type PlannedPiece } from '../content/contentPiece';
import { mediumLabelOf } from '../projections/contentPiecePage';
import { monthAfter, monthBefore, planMonthKeyOf, planMonthLabelOf, type PlanMonth } from './planMonth';
import { kindCountsOf, planCountsOf } from './planCounts';
import { ukClockAt } from '$lib/data/ukClock';
import { weeksOfMonth, type PlanDayDate } from './planDays';
import { awaitedOnOf, isOutsideRhythm, rhythmTalliesOf } from './planRhythm';
import { postsOfDay } from './planPosts';
import { awaitingPictureCountOf, type PlanPictures } from './planPictures';
import type { PostingRhythm } from '../rhythm/postingRhythm';
import type { ContentPlan, PlanDay, PlanEntry, PlanWeek } from './contentPlan';

const nothingOnIt = 0;

/**
 * The month's plan from the brand's pieces: each on the day it goes out, the days with nothing on them left showing,
 * each week held against the brand's posting rhythms, and each post with where its picture stands.
 */
export function contentPlanOf(
	month: PlanMonth,
	pieces: PlannedPiece[],
	rhythms: PostingRhythm[] = [],
	pictures: PlanPictures = new Map()
): ContentPlan {
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
		awaitingPictureCount: awaitingPictureCountOf(entries, pictures),
		rhythms,
		weeks: weeksOfMonth(month).map((days) => weekOf(days, entries, { rhythms, pictures }))
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
	const { id, postId, mediumPath, kind, title, hook, stage } = piece;
	const canMove = stage !== ContentStages.published;
	const isExtra = isOutsideRhythm(rhythms, { date, mediumPath });
	return { id, postId, date, time, mediumPath, medium: mediumLabelOf(mediumPath), kind, title, hook, stage, canMove, isExtra };
}

/** What a week of the plan is held against: the brand's posting rhythms, and what each post says of its picture. */
type WeekStandards = { rhythms: PostingRhythm[]; pictures: PlanPictures };

function weekOf(days: PlanDayDate[], entries: PlanEntry[], { rhythms, pictures }: WeekStandards): PlanWeek {
	const weekEntries = entries.filter((entry) => days.some((day) => day.date === entry.date));
	const tallies = rhythmTalliesOf(rhythms, days, weekEntries);
	const plannedDays = days.map((day) => dayOf(day, weekEntries, awaitedOnOf(rhythms, tallies, day, weekEntries), pictures));
	const [firstDay] = days;
	return { key: firstDay.date, label: `Week of ${firstDay.label}`, days: plannedDays, entryCount: weekEntries.length, tallies };
}

function dayOf(day: PlanDayDate, entries: PlanEntry[], awaitedOn: string[], pictures: PlanPictures): PlanDay {
	const dayEntries = entries.filter((entry) => entry.date === day.date);
	return { ...day, entries: dayEntries, posts: postsOfDay(dayEntries, pictures), isEmpty: dayEntries.length === nothingOnIt, awaitedOn };
}
