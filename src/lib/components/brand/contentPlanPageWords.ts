import { brandPathOf } from './brandKitPageWords';
import type { PlanEntry } from '$lib/brand/plan/contentPlan';
import type { PlanPost } from '$lib/brand/plan/planPosts';
import type { RhythmTally } from '$lib/brand/plan/planRhythm';

export const nothingPlanned = 'Nothing planned';

export const noKindsThisMonth = 'Nothing is planned this month, so there is no mix of kinds yet.';

export function contentPlanPathOf(organisationId: string, monthKey?: string): string {
	const path = `${brandPathOf(organisationId)}/plan`;
	if (monthKey === undefined) return path;
	return `${path}?month=${monthKey}`;
}

export const noRhythmYet =
	'No posting rhythm is in the kit yet. Your Claude records the posting days, the time and the posts a week through the Your Business Today connector.';

export const anyDay = 'Any day';

export const anyTime = 'Any time';

export const postDue = 'Post due';

export const extraPost = 'Extra';

export function tallyLabelOf({ medium, count, due, isShort }: RhythmTally): string {
	const shortBy = isShort ? `, ${due - count} short` : '';
	return `${medium}: ${count} of ${due}${shortBy}`;
}

export function extraLabelOf({ medium, extra }: RhythmTally): string {
	return `${medium}: ${extra} extra`;
}

/** A post's channels sit one above the other in each of its cells, so a channel's stage and its Move line up. */
export const channelListClasses = 'flex flex-col gap-1';

const onlyChannel = 1;

/** A post on several channels moves one channel at a time, each to its own day. */
export function moveLabelOf(channel: PlanEntry, post: PlanPost): string {
	if (post.channels.length === onlyChannel) return 'Move';
	return `Move ${channel.medium}`;
}
