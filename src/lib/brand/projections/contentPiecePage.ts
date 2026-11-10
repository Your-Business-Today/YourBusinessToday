import { audienceActions } from '../actions/audienceActions';
import { ContentStages, type ContentPiece, type ContentReview, type ContentSummary, type StoryboardShot } from '../content/contentPiece';
import { findMedium } from '../mediums/mediumCatalogue';
import { postOfItsOwn, type ContentPost } from '../posts/contentPost';

/** A piece waiting for approval, as the Brand page lists it. */
export type AwaitingPieceRow = { id: string; title: string; medium: string; updatedAt: string };

export type ShotRow = { number: number; seconds: number; description: string; onScreenText: string };

export type ReviewEntry = { key: string; verdict: string; body: string; createdAt: string };

/** A channel of the piece's post: what it goes out on, where it stands, its own caption, and whether it is this piece. */
export type PostChannelRow = { id: string; medium: string; stage: ContentPiece['stage']; caption: string; isThisPiece: boolean };

/** One piece as its page shows it: its words, its storyboard, where it stands and what has been said of it. */
export type ContentPiecePage = {
	id: string;
	postId: string;
	title: string;
	medium: string;
	stage: ContentPiece['stage'];
	isAwaitingApproval: boolean;
	hook: string;
	script: string;
	caption: string;
	invitedAction: string;
	scheduledFor: string | null;
	plannedFor: string | null;
	publishedUrl: string;
	shots: ShotRow[];
	reviews: ReviewEntry[];
	channels: PostChannelRow[];
};

const firstShotNumber = 1;
const nothingInvited = 'Nothing in particular';

export function mediumLabelOf(mediumPath: string): string {
	const medium = findMedium(mediumPath);
	return medium?.label ?? mediumPath;
}

export function awaitingPieceRowOf(piece: ContentSummary): AwaitingPieceRow {
	const { id, title, updatedAt } = piece;
	return { id, title, medium: mediumLabelOf(piece.mediumPath), updatedAt };
}

export function contentPiecePageOf(piece: ContentPiece, reviews: ContentReview[], post: ContentPost = postOfItsOwn(piece)): ContentPiecePage {
	const { id, title, stage, hook, script, caption, scheduledFor, plannedFor, publishedUrl } = piece;
	return {
		...{ id, title, stage, hook, script, caption, scheduledFor, plannedFor, publishedUrl },
		postId: post.id,
		medium: mediumLabelOf(piece.mediumPath),
		isAwaitingApproval: stage === ContentStages.awaitingApproval,
		invitedAction: invitedActionLabelOf(piece.invitedAction),
		shots: piece.storyboard.map(shotRowOf),
		reviews: reviews.map(reviewEntryOf),
		channels: post.channels.map((channel) => postChannelRowOf(channel, piece.id))
	};
}

function postChannelRowOf(channel: ContentPiece, contentPieceId: string): PostChannelRow {
	const { id, stage, caption } = channel;
	return { id, stage, caption, medium: mediumLabelOf(channel.mediumPath), isThisPiece: id === contentPieceId };
}

function invitedActionLabelOf(actionKey: string): string {
	const action = audienceActions.find((candidate) => candidate.key === actionKey);
	return action?.label ?? nothingInvited;
}

function shotRowOf(shot: StoryboardShot, index: number): ShotRow {
	return { number: index + firstShotNumber, ...shot };
}

function reviewEntryOf(review: ContentReview, index: number): ReviewEntry {
	return { key: `${index}-${review.createdAt}`, ...review };
}
