import type { ContentStage } from './contentPiece';
import type { ReviewVerdict } from './contentReview';

/** Each stage of a piece as a person reads it. */
export const contentStageLabels: Record<ContentStage, string> = {
	idea: 'Idea',
	drafted: 'Drafted',
	awaiting_approval: 'Awaiting approval',
	approved: 'Approved',
	scheduled: 'Scheduled',
	published: 'Published'
};

/** Each verdict of a review as a person reads it. */
export const reviewVerdictLabels: Record<ReviewVerdict, string> = {
	comment: 'Comment',
	changes_requested: 'Asked for a change',
	approved: 'Approved'
};

export function stageLabelOf(stage: string): string {
	return contentStageLabels[stage as ContentStage] ?? stage;
}

export function verdictLabelOf(verdict: string): string {
	return reviewVerdictLabels[verdict as ReviewVerdict] ?? verdict;
}

/** The stage as it reads inside a sentence: "this piece is awaiting approval". */
export function stageInSentenceOf(stage: string): string {
	const label = stageLabelOf(stage);
	return label.toLowerCase();
}
