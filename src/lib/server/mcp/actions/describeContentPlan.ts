import { describePostingRhythms, describeTally } from './describePostingRhythm';
import { noKindYet, type KindCount } from '$lib/brand/plan/planCounts';
import type { ContentPlan, PlanDay, PlanEntry, PlanWeek } from '$lib/brand/plan/contentPlan';
import type { PlanPost } from '$lib/brand/plan/planPosts';

/**
 * The month's plan as the connector reads it out: the counts, the mix of kinds and the posting rhythm, then each week
 * day by day against the rhythm, the empty days left in and the days a post is due marked.
 */
export function describeContentPlan(brandName: string, plan: ContentPlan): string {
	const { planned, scheduled, published, stillToDo } = plan.counts;
	const heading =
		`${brandName}’s plan for ${plan.monthLabel}: ${planned} planned, ${scheduled} scheduled, ` +
		`${published} published, ${stillToDo} still to do. Times are on the UK clock.`;
	const rhythm = describePostingRhythms(plan.rhythms);
	return [heading, kindsLine(plan.kindCounts), rhythm, ...plan.weeks.map(weekSection)].filter((section) => section !== null).join('\n\n');
}

function kindsLine(kindCounts: KindCount[]): string | null {
	if (kindCounts.length === 0) return null;
	return `Kinds of post: ${kindCounts.map(({ kind, count }) => `${kind} ${count}`).join(', ')}.`;
}

function weekSection(week: PlanWeek): string {
	const tallies = week.tallies.map(describeTally).join('; ');
	const heading = tallies === '' ? week.label : `${week.label} — ${tallies}`;
	return [heading, ...week.days.flatMap(dayLines)].join('\n');
}

function dayLines(day: PlanDay): string[] {
	const due = dueOn(day.awaitedOn);
	if (day.isEmpty) return [`- ${day.label}: nothing planned${due.map((text) => ` — ${text}`).join('')}`];
	const posts = day.posts.map((post) => `- ${day.label} ${postLines(post)}`);
	return [...posts, ...due.map((text) => `- ${day.label}: ${text}`)];
}

function dueOn(awaitedOn: string[]): string[] {
	if (awaitedOn.length === 0) return [];
	return [`a post is due for ${awaitedOn.join(' and ')}`];
}

/** A post on one channel reads as one line; a post on several names its words once, then each channel on a line of its own. */
function postLines(post: PlanPost): string {
	const [onlyChannel] = post.channels;
	if (post.channels.length === 1) return entryLine(onlyChannel);
	const heading = `${post.time} ${post.title} (${kindOf(post.kind)})${hookOf(post.hook)} — one post on ${post.channels.length} channels:`;
	const channelLines = post.channels.map((channel) => `    - ${channel.time} [${channel.stage}] @ ${channel.mediumPath} (id ${channel.id})${extraOf(channel)}`);
	return [heading, ...channelLines].join('\n');
}

function entryLine(entry: PlanEntry): string {
	const { time, stage, title, mediumPath, id } = entry;
	return `${time} [${stage}] ${title} (${kindOf(entry.kind)}) @ ${mediumPath}${hookOf(entry.hook)} (id ${id})${extraOf(entry)}`;
}

function hookOf(hook: string): string {
	return hook === '' ? '' : ` — “${hook}”`;
}

function kindOf(kind: string | null): string {
	return kind ?? noKindYet.toLowerCase();
}

function extraOf(entry: PlanEntry): string {
	return entry.isExtra ? ' [extra: outside the posting rhythm]' : '';
}
