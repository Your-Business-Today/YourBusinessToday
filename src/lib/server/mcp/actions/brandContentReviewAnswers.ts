import { noSuchPiece } from './brandContentAnswers';
import type { ContentReviewWords } from '$lib/brand/content/contentReviewOutcome';

/** What review_content tells the caller's Claude of each outcome. */
export const contentReviewAnswers: ContentReviewWords = {
	refused: ({ problem }) => `The review was not kept: ${problem}. Nothing was kept.`,
	noSuchPiece: () => noSuchPiece,
	wrongStage: ({ refusal, stage }) => `The review was not kept: ${refusal}, and this one is at ${stage}. Nothing was kept.`,
	commented: ({ verdict, stage }) => `Your ${verdict} is kept on the piece, which stays at ${stage}.`,
	movedOnAlready: () => 'Your review is kept, but the piece had moved on already, so it stays where it is.',
	moved: ({ stage }) => `Your review is kept and the piece is now at ${stage}.`
};
