import { canTakeMove } from '$lib/brand/content/contentMoves';
import { checkContentReview } from '$lib/brand/content/checkContentReview';
import { findContentPieceStage } from './findContentPieceStage';
import { isUuid } from '$lib/data/isUuid';
import { keepContentReview } from './keepContentReview';
import { moveAfterVerdict } from '$lib/brand/content/contentReview';
import { moveContentPiece } from './moveContentPiece';
import type { ContentReviewOutcome } from '$lib/brand/content/contentReviewOutcome';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Who reviews which of the organisation's pieces. */
export type PieceReviewer = { organisationId: string; contentPieceId: string; authorId: string };

/**
 * Keeps a person's review of a piece, checked against its columns; an approval or a change asked for moves
 * the piece as well, only from awaiting approval. The connector's review_content and the piece's page both run it.
 */
export async function reviewContentPiece(
	supabase: SupabaseClient,
	reviewer: PieceReviewer,
	input: Record<string, unknown>
): Promise<ContentReviewOutcome> {
	const check = checkContentReview(input);
	if ('problem' in check) return { kind: 'refused', problem: check.problem };
	const { review } = check;
	const { organisationId, contentPieceId } = reviewer;
	const stage = isUuid(contentPieceId) ? await findContentPieceStage(supabase, organisationId, contentPieceId) : null;
	if (stage === null) return { kind: 'noSuchPiece' };
	const rule = moveAfterVerdict[review.verdict];
	const isRefused = rule !== null && !canTakeMove(rule, stage);
	if (isRefused) return { kind: 'wrongStage', refusal: rule.refusal, stage };
	await keepContentReview(supabase, { ...reviewer, review });
	if (rule === null) return { kind: 'commented', verdict: review.verdict, stage };
	const hasMoved = await moveContentPiece(supabase, organisationId, contentPieceId, { rule });
	if (!hasMoved) return { kind: 'movedOnAlready' };
	return { kind: 'moved', stage: rule.to };
}
