import { ContentStages } from '../content/contentPiece';
import type { PlanEntry } from './contentPlan';

/** The row of counts above the plan, as the agency's planner kept them. */
export type PlanCounts = { planned: number; scheduled: number; published: number; stillToDo: number };

/** How many of the month's pieces are of one kind of post, so the mix shows. */
export type KindCount = { kind: string; count: number };

/** What a piece planned before the brand kept kinds of post is counted as. */
export const noKindYet = 'No kind yet';

export function planCountsOf(entries: PlanEntry[]): PlanCounts {
	const planned = entries.length;
	const scheduled = entries.filter((entry) => entry.stage === ContentStages.scheduled).length;
	const published = entries.filter((entry) => entry.stage === ContentStages.published).length;
	return { planned, scheduled, published, stillToDo: planned - scheduled - published };
}

/** The month's kinds of post, the most planned first, each with how many pieces are of it. */
export function kindCountsOf(entries: PlanEntry[]): KindCount[] {
	const kinds = entries.map((entry) => entry.kind ?? noKindYet);
	const distinctKinds = [...new Set(kinds)];
	return distinctKinds
		.map((kind) => ({ kind, count: kinds.filter((candidate) => candidate === kind).length }))
		.sort((first, second) => second.count - first.count || first.kind.localeCompare(second.kind));
}
