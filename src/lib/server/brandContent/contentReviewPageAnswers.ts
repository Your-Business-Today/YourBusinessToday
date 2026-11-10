import { fail } from '@sveltejs/kit';
import { stageInSentenceOf } from '$lib/brand/content/contentWords';
import { wordsForOutcome, type ContentReviewOutcome, type ContentReviewOutcomeKind, type ContentReviewWords } from '$lib/brand/content/contentReviewOutcome';

/** What the piece's page tells the person of each outcome of their review. */
const contentReviewPageWords: ContentReviewWords = {
	refused: ({ problem }) => `Your review was not kept: ${problem}.`,
	noSuchPiece: () => 'This piece is no longer in the brand’s content.',
	wrongStage: ({ refusal, stage }) => `${refusal}, and this one is ${stageInSentenceOf(stage)}. Nothing was kept.`,
	commented: () => 'Your comment is kept on the piece.',
	movedOnAlready: () => 'Your review is kept, but someone moved the piece on first, so it stays where it is.',
	moved: ({ stage }) => `Your review is kept and the piece is now ${stageInSentenceOf(stage)}.`
};

const ReviewRefusalStatus = { badRequest: 400, notFound: 404, conflict: 409 } as const;

const refusalStatusOf: Partial<Record<ContentReviewOutcomeKind, number>> = {
	refused: ReviewRefusalStatus.badRequest,
	noSuchPiece: ReviewRefusalStatus.notFound,
	wrongStage: ReviewRefusalStatus.conflict
};

/** The form action's answer: a failure carrying why nothing was kept, or the words of what was. */
export function pageAnswerFor(outcome: ContentReviewOutcome) {
	const message = wordsForOutcome(contentReviewPageWords, outcome);
	const status = refusalStatusOf[outcome.kind];
	if (status === undefined) return { message };
	return fail(status, { message });
}
