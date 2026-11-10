import { rhythmFor, type PostingRhythm } from '../rhythm/postingRhythm';
import { weekdayOfDate, weekdays } from '../values/weekdays';
import type { PlanDayDate } from './planDays';

/** One rhythm's week: the posts on its days against the number due, and how many were planned outside it. */
export type RhythmTally = { mediumPath: string; medium: string; count: number; due: number; extra: number; isShort: boolean };

/** What the rhythm needs to know of a piece on the plan: the day it goes out, where, and whether it is outside the rhythm. */
type PlacedPiece = { date: string; mediumPath: string; isExtra: boolean };

const noPosts = 0;

/** A piece planned on a day its rhythm does not post, or where the rhythm is no posts at all. It is kept, and shown as extra. */
export function isOutsideRhythm(rhythms: PostingRhythm[], piece: Omit<PlacedPiece, 'isExtra'>): boolean {
	const rhythm = rhythmFor(rhythms, piece.mediumPath);
	if (rhythm === null) return false;
	if (rhythm.postsAWeek === noPosts) return true;
	return !isPostingDay(rhythm, piece.date);
}

export function rhythmTalliesOf(rhythms: PostingRhythm[], days: PlanDayDate[], pieces: PlacedPiece[]): RhythmTally[] {
	return rhythms.map((rhythm) => tallyOf(rhythm, days, piecesOf(rhythms, rhythm, pieces)));
}

/** The rhythms short this week whose posting day this is and that have nothing on it: where the next post wants to go. */
export function awaitedOnOf(rhythms: PostingRhythm[], tallies: RhythmTally[], day: PlanDayDate, pieces: PlacedPiece[]): string[] {
	const piecesOnDay = pieces.filter((piece) => piece.date === day.date);
	return rhythms
		.filter((rhythm, index) => tallies[index].isShort && rhythm.days !== null && isPostingDay(rhythm, day.date))
		.filter((rhythm) => piecesOf(rhythms, rhythm, piecesOnDay).length === noPosts)
		.map((rhythm) => rhythm.medium);
}

function tallyOf(rhythm: PostingRhythm, days: PlanDayDate[], pieces: PlacedPiece[]): RhythmTally {
	const count = pieces.filter((piece) => !piece.isExtra).length;
	const due = dueIn(rhythm, days);
	const { mediumPath, medium } = rhythm;
	return { mediumPath, medium, count, due, extra: pieces.length - count, isShort: count < due };
}

/** The posts due in a week, in proportion to its posting days that fall in the month: a week cut short by the month is due fewer. */
function dueIn(rhythm: PostingRhythm, days: PlanDayDate[]): number {
	const postingDaysInFullWeek = rhythm.days ?? weekdays;
	const postingDaysThisWeek = days.filter((day) => isPostingDay(rhythm, day.date)).length;
	return Math.round((rhythm.postsAWeek * postingDaysThisWeek) / postingDaysInFullWeek.length);
}

function piecesOf(rhythms: PostingRhythm[], rhythm: PostingRhythm, pieces: PlacedPiece[]): PlacedPiece[] {
	return pieces.filter((piece) => rhythmFor(rhythms, piece.mediumPath) === rhythm);
}

function isPostingDay(rhythm: PostingRhythm, date: string): boolean {
	if (rhythm.days === null) return true;
	return rhythm.days.includes(weekdayOfDate(date));
}
