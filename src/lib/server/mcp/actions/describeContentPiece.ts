import type { ContentPieceWithReviews } from '$lib/server/brandContent/findContentPiece';
import type { BrandSnapshot, ContentPiece, ContentReview, ContentSummary, StoryboardShot } from '$lib/brand/content/contentPiece';
import type { ContentPost } from '$lib/brand/posts/contentPost';
import { describePostPictures } from './describePostPictures';
import { noPictures, type PostPictures } from '$lib/brand/pictures/postPictures';

const firstShotNumber = 1;
const nothingInvited = 'nothing in particular';

/** One line of a listing: the piece's stage, title, medium and id. */
export function describeContentSummary(piece: ContentSummary): string {
	return `- [${piece.stage}] ${piece.title} @ ${piece.mediumPath} (id ${piece.id})`;
}

/**
 * One piece in full: its words, its storyboard, where it stands, every review, the brand it was drafted to, every
 * channel of its post and the post's picture.
 */
export function describeContentPiece(
	{ piece, reviews }: ContentPieceWithReviews,
	post: ContentPost,
	pictures: PostPictures = noPictures
): string {
	const sections = [
		`${piece.title} — ${piece.stage} — ${piece.mediumPath} (id ${piece.id})`,
		piece.kind === null ? null : `Kind of post: ${piece.kind}`,
		`Hook: ${piece.hook}`,
		`Script:\n${piece.script}`,
		storyboardSection(piece.storyboard),
		`Caption: ${piece.caption}`,
		`Invites: ${piece.invitedAction || nothingInvited}`,
		piece.plannedFor === null ? null : `Planned for ${piece.plannedFor}`,
		piece.scheduledFor === null ? null : `Scheduled for ${piece.scheduledFor}`,
		piece.publishedUrl === '' ? null : `Published at ${piece.publishedUrl}`,
		reviewsSection(reviews),
		channelsSection(post, piece.id),
		describePostPictures(pictures),
		snapshotSection(piece.brandSnapshot)
	];
	return sections.filter((section) => section !== null).join('\n\n');
}

function storyboardSection(storyboard: StoryboardShot[]): string | null {
	if (storyboard.length === 0) return null;
	const shotLines = storyboard.map((shot, index) => `${index + firstShotNumber}. ${shotLine(shot)}`);
	return `Storyboard:\n${shotLines.join('\n')}`;
}

function shotLine(shot: StoryboardShot): string {
	const shown = shot.onScreenText === '' ? '' : ` — on screen: “${shot.onScreenText}”`;
	return `(${shot.seconds}s) ${shot.description}${shown}`;
}

function reviewsSection(reviews: ContentReview[]): string {
	if (reviews.length === 0) return 'No reviews yet.';
	const reviewLines = reviews.map((review) => `- ${review.createdAt} ${review.verdict}: ${review.body}`);
	return `Reviews:\n${reviewLines.join('\n')}`;
}

function channelsSection(post: ContentPost, contentPieceId: string): string {
	const { channels } = post;
	if (channels.length === 1) return 'The post goes out on this channel only. add_content_channel sends it out on another.';
	const channelLines = channels.map((channel) => channelLine(channel, channel.id === contentPieceId));
	return `The post goes out on ${channels.length} channels, each approved, scheduled and published on its own:\n${channelLines.join('\n')}`;
}

function channelLine(channel: ContentPiece, isThisOne: boolean): string {
	const marker = isThisOne ? ' — this one' : '';
	const caption = channel.caption === '' ? 'no caption yet' : `caption: ${channel.caption}`;
	return `- [${channel.stage}] ${channel.mediumPath} (id ${channel.id})${marker} — ${caption}`;
}

function snapshotSection(snapshot: BrandSnapshot): string {
	return `Brand as it held when drafted:\n${snapshot.brief ?? ''}`;
}
