import { ContentStages } from '../content/contentPiece';
import { isAwaitingPicture, type PictureSummary } from '../pictures/postPictures';
import type { ContentPlan, PlanDay, PlanEntry } from '../plan/contentPlan';
import type { PlanPost } from '../plan/planPosts';
import type { PieceAsShown } from './monthApproval';

const noChannels = 0;

/**
 * A post of the month with the channels of it that wait for approval, each with its own words: the day and time it goes
 * out, its kind, working title, and where its picture stands, said once for the post.
 */
export type ApprovalPost = {
	postId: string;
	dayLabel: string;
	time: string;
	kind: string | null;
	title: string;
	picture: PictureSummary;
	channels: PlanEntry[];
};

/** Every post of the month with a channel awaiting approval, in the order they go out. */
export function awaitingApprovalOf(plan: ContentPlan): ApprovalPost[] {
	const days = plan.weeks.flatMap((week) => week.days);
	return days.flatMap(awaitingPostsOfDay);
}

function awaitingPostsOfDay(day: PlanDay): ApprovalPost[] {
	return day.posts.flatMap((post) => awaitingPartOf(post, day.label));
}

/** The post with only its channels awaiting approval, or nothing when none of them is. */
function awaitingPartOf(post: PlanPost, dayLabel: string): ApprovalPost[] {
	const channels = post.channels.filter(isAwaitingApproval);
	if (channels.length === noChannels) return [];
	return [{ ...post, dayLabel, channels }];
}

/** Each piece of the month as it was read, for the client to approve exactly what they were shown. */
export function piecesShownOf(posts: ApprovalPost[]): PieceAsShown[] {
	const channels = posts.flatMap((post) => post.channels);
	return channels.map((channel) => ({ contentPieceId: channel.id, updatedAt: channel.updatedAt }));
}

/** How many posts with a channel just approved still wait on a picture, each post counted once. */
export function approvedAwaitingPictureCountOf(posts: ApprovalPost[], approvedIds: Set<string>): number {
	const approvedPosts = posts.filter((post) => post.channels.some((channel) => approvedIds.has(channel.id)));
	return approvedPosts.filter((post) => isAwaitingPicture(post.picture)).length;
}

/** How many posts have a channel among those just approved. */
export function approvedPostCountOf(posts: ApprovalPost[], approvedIds: Set<string>): number {
	return posts.filter((post) => post.channels.some((channel) => approvedIds.has(channel.id))).length;
}

function isAwaitingApproval(entry: PlanEntry): boolean {
	return entry.stage === ContentStages.awaitingApproval;
}
