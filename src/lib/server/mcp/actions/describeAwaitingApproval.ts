import { awaitingApprovalOf, type ApprovalPost } from '$lib/brand/approval/awaitingApproval';
import { pictureMarkOf } from './describePostPictures';
import type { ContentPlan, PlanEntry } from '$lib/brand/plan/contentPlan';

const justOne = 1;
const nothingWaiting = 0;

/**
 * The month's posts waiting for approval, as the client's Claude shows them: each channel's own words, the picture said
 * once for the post, and each piece's id and when it was last changed, which approve_content_month takes back. Null when
 * nothing of the month waits for approval.
 */
export function describeAwaitingApproval(plan: ContentPlan): string | null {
	const posts = awaitingApprovalOf(plan);
	const pieceCount = posts.flatMap((post) => post.channels).length;
	if (pieceCount === nothingWaiting) return null;
	const pieces = pieceCount === justOne ? '1 piece' : `${pieceCount} pieces`;
	const heading =
		`Waiting for approval this month: ${pieces}. Show the client each caption and picture, then approve them together ` +
		'with approve_content_month, giving each piece’s id and updatedAt as read here; to ask for a change to one post, ' +
		'use review_content on its piece.';
	return [heading, ...posts.map(postLines)].join('\n');
}

function postLines(post: ApprovalPost): string {
	const { picture } = post;
	const needed = picture.needed === null ? '' : ` — picture needed: ${picture.needed}`;
	const heading = `- ${post.dayLabel} ${post.time} ${post.title}${pictureMarkOf(picture)}${needed}`;
	return [heading, ...post.channels.map(channelLine)].join('\n');
}

function channelLine(channel: PlanEntry): string {
	const caption = channel.caption === '' ? 'no caption yet' : `“${channel.caption}”`;
	return `    - ${channel.medium} (id ${channel.id}, updatedAt ${channel.updatedAt}): ${caption}`;
}
