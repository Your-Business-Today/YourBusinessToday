import type { ContentStage } from '../content/contentPiece';
import type { KindCount, PlanCounts } from './planCounts';
import type { PlanDayDate } from './planDays';

/** One piece on its day of the plan: when it goes out on the UK clock, what it is for, its kind of post, working title, opening line and stage. */
export type PlanEntry = {
	id: string;
	date: string;
	time: string;
	mediumPath: string;
	medium: string;
	kind: string | null;
	title: string;
	hook: string;
	stage: ContentStage;
	canMove: boolean;
};

export type PlanDay = PlanDayDate & { entries: PlanEntry[]; isEmpty: boolean };

/** A week of the plan, Monday to Sunday, cut short at the ends of the month. */
export type PlanWeek = { key: string; label: string; days: PlanDay[]; entryCount: number };

/** One month of a brand's content, laid out week by week on the day each piece goes out. */
export type ContentPlan = {
	monthKey: string;
	monthLabel: string;
	previousMonthKey: string;
	nextMonthKey: string;
	counts: PlanCounts;
	kindCounts: KindCount[];
	weeks: PlanWeek[];
};
