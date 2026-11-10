import type { ContentPlan, PlanDay, PlanEntry, PlanWeek } from '$lib/brand/plan/contentPlan';

/** The month's plan as the connector reads it out: the counts, then each week day by day, the empty days left in. */
export function describeContentPlan(brandName: string, plan: ContentPlan): string {
	const { planned, scheduled, published, stillToDo } = plan.counts;
	const heading =
		`${brandName}’s plan for ${plan.monthLabel}: ${planned} planned, ${scheduled} scheduled, ` +
		`${published} published, ${stillToDo} still to do. Times are on the UK clock.`;
	return [heading, ...plan.weeks.map(weekSection)].join('\n\n');
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
	return `${entry.time} [${entry.stage}] ${entry.title} @ ${entry.mediumPath}${hook} (id ${entry.id})`;
}
