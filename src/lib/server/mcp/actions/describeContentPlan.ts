import { noKindYet, type KindCount } from '$lib/brand/plan/planCounts';
import type { ContentPlan, PlanDay, PlanEntry, PlanWeek } from '$lib/brand/plan/contentPlan';

/** The month's plan as the connector reads it out: the counts and the mix of kinds, then each week day by day, the empty days left in. */
export function describeContentPlan(brandName: string, plan: ContentPlan): string {
	const { planned, scheduled, published, stillToDo } = plan.counts;
	const heading =
		`${brandName}’s plan for ${plan.monthLabel}: ${planned} planned, ${scheduled} scheduled, ` +
		`${published} published, ${stillToDo} still to do. Times are on the UK clock.`;
	return [heading, kindsLine(plan.kindCounts), ...plan.weeks.map(weekSection)].filter((section) => section !== null).join('\n\n');
}

function kindsLine(kindCounts: KindCount[]): string | null {
	if (kindCounts.length === 0) return null;
	return `Kinds of post: ${kindCounts.map(({ kind, count }) => `${kind} ${count}`).join(', ')}.`;
}

function weekSection(week: PlanWeek): string {
	return [week.label, ...week.days.flatMap(dayLines)].join('\n');
}

function dayLines(day: PlanDay): string[] {
	if (day.isEmpty) return [`- ${day.label}: nothing planned`];
	return day.entries.map((entry) => `- ${day.label} ${entryLine(entry)}`);
}

function entryLine(entry: PlanEntry): string {
	const hook = entry.hook === '' ? '' : ` — “${entry.hook}”`;
	const kind = entry.kind ?? noKindYet.toLowerCase();
	return `${entry.time} [${entry.stage}] ${entry.title} (${kind}) @ ${entry.mediumPath}${hook} (id ${entry.id})`;
}
