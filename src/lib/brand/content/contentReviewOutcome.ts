import type { ContentStage } from './contentPiece';
import type { ReviewVerdict } from './contentReview';

/** What came of a review: refused and kept nothing, kept as a comment, or kept with the piece moved on. */
export type ContentReviewOutcome =
	| { kind: 'refused'; problem: string }
	| { kind: 'noSuchPiece' }
	| { kind: 'wrongStage'; refusal: string; stage: ContentStage }
	| { kind: 'commented'; verdict: ReviewVerdict; stage: ContentStage }
	| { kind: 'movedOnAlready' }
	| { kind: 'moved'; stage: ContentStage };

export type ContentReviewOutcomeKind = ContentReviewOutcome['kind'];

/** Words for every outcome, each written for the outcome it answers. */
export type ContentReviewWords = {
	[Kind in ContentReviewOutcomeKind]: (outcome: Extract<ContentReviewOutcome, { kind: Kind }>) => string;
};

export function wordsForOutcome(words: ContentReviewWords, outcome: ContentReviewOutcome): string {
	const describe = words[outcome.kind] as (outcome: ContentReviewOutcome) => string;
	return describe(outcome);
}
