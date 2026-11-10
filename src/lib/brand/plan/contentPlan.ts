import type { ContentStage } from '../content/contentPiece';
import type { KindCount, PlanCounts } from './planCounts';
import type { PlanDayDate } from './planDays';
import type { PlanPost } from './planPosts';
import type { PostingRhythm } from '../rhythm/postingRhythm';
import type { RhythmTally } from './planRhythm';

/**
 * One piece on its day of the plan: the post it is a channel of, when it goes out on the UK clock, what it is for, its
 * kind of post, working title, opening line and stage, and whether it is planned outside the brand's posting rhythm.
 */
export type PlanEntry = {
	id: string;
	postId: string;
	date: string;
	time: string;
	mediumPath: string;
	medium: string;
	kind: string | null;
	title: string;
	hook: string;
	stage: ContentStage;
	canMove: boolean;
	isExtra: boolean;
};

/**
 * A day of the plan: each channel's piece on it, the same gathered into the posts they are channels of, and the mediums
 * whose rhythm wants a post on it and has none, in a week that is short.
 */
export type PlanDay = PlanDayDate & { entries: PlanEntry[]; posts: PlanPost[]; isEmpty: boolean; awaitedOn: string[] };

/** A week of the plan, Monday to Sunday, cut short at the ends of the month, with each rhythm's count against the number due. */
export type PlanWeek = { key: string; label: string; days: PlanDay[]; entryCount: number; tallies: RhythmTally[] };

/** One month of a brand's content, laid out week by week on the day each piece goes out. */
export type ContentPlan = {
	monthKey: string;
	monthLabel: string;
	previousMonthKey: string;
	nextMonthKey: string;
	counts: PlanCounts;
	kindCounts: KindCount[];
	rhythms: PostingRhythm[];
	weeks: PlanWeek[];
};
