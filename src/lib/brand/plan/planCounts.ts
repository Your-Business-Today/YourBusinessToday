import { ContentStages } from '../content/contentPiece';
import type { PlanEntry } from './contentPlan';

/** The row of counts above the plan, as the agency's planner kept them. */
export type PlanCounts = { planned: number; scheduled: number; published: number; stillToDo: number };

export function planCountsOf(entries: PlanEntry[]): PlanCounts {
	const planned = entries.length;
	const scheduled = entries.filter((entry) => entry.stage === ContentStages.scheduled).length;
	const published = entries.filter((entry) => entry.stage === ContentStages.published).length;
	return { planned, scheduled, published, stillToDo: planned - scheduled - published };
}
