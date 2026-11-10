import { ContentMoves, type ContentMoveRule } from './contentMoves';

/** What a person says of a piece: a comment, a change asked for, or an approval. */
export const ReviewVerdicts = {
	comment: 'comment',
	changesRequested: 'changes_requested',
	approved: 'approved'
} as const;

export type ReviewVerdict = (typeof ReviewVerdicts)[keyof typeof ReviewVerdicts];

export const reviewVerdicts: ReviewVerdict[] = Object.values(ReviewVerdicts);

/** The step a verdict moves the piece by, or null when it only adds to what has been said. */
export const moveAfterVerdict: Record<ReviewVerdict, ContentMoveRule | null> = {
	comment: null,
	changes_requested: ContentMoves.askForChanges,
	approved: ContentMoves.approve
};

export type ContentReviewToKeep = { verdict: ReviewVerdict; body: string };

export type ContentReviewCheck = { review: ContentReviewToKeep } | { problem: string };

export function isReviewVerdict(candidate: string): candidate is ReviewVerdict {
	return (reviewVerdicts as string[]).includes(candidate);
}
