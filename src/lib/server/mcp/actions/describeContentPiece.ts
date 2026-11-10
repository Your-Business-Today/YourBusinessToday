import type { ContentPieceWithReviews } from '$lib/server/brandContent/findContentPiece';
import type { BrandSnapshot, ContentReview, ContentSummary, StoryboardShot } from '$lib/brand/content/contentPiece';

const firstShotNumber = 1;
const nothingInvited = 'nothing in particular';

/** One line of a listing: the piece's stage, title, medium and id. */
export function describeContentSummary(piece: ContentSummary): string {
	return `- [${piece.stage}] ${piece.title} @ ${piece.mediumPath} (id ${piece.id})`;
}

/** One piece in full: its words, its storyboard, where it stands, every review and the brand it was drafted to. */
export function describeContentPiece({ piece, reviews }: ContentPieceWithReviews): string {
	const sections = [
		`${piece.title} — ${piece.stage} — ${piece.mediumPath} (id ${piece.id})`,
		`Hook: ${piece.hook}`,
		`Script:\n${piece.script}`,
		storyboardSection(piece.storyboard),
		`Caption: ${piece.caption}`,
		`Invites: ${piece.invitedAction || nothingInvited}`,
		piece.scheduledFor === null ? null : `Scheduled for ${piece.scheduledFor}`,
		piece.publishedUrl === '' ? null : `Published at ${piece.publishedUrl}`,
		reviewsSection(reviews),
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

function snapshotSection(snapshot: BrandSnapshot): string {
	return `Brand as it held when drafted:\n${snapshot.brief ?? ''}`;
}
