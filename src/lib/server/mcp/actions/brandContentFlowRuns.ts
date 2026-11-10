import { canTakeMove, ContentMoves } from '$lib/brand/content/contentMoves';
import { checkContentReview } from '$lib/brand/content/checkContentReview';
import { checkPublishedUrl } from '$lib/server/brandContent/checkPublishedUrl';
import { checkScheduledFor } from '$lib/brand/content/checkScheduledFor';
import { keepContentReview } from '$lib/server/brandContent/keepContentReview';
import { moveAfterVerdict } from '$lib/brand/content/contentReview';
import { moveContentPiece } from '$lib/server/brandContent/moveContentPiece';
import { noSuchPiece } from './brandContentAnswers';
import { nothingChanged, pieceAsked, stageOf, takeMove } from './brandContentPieceMoves';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type Input = Record<string, unknown>;

const sentForApproval =
	'Sent for approval: the piece is at awaiting_approval. Anyone on the organisation with Brand ' +
	'approves it, or asks for changes, with review_content.';
const postByHand = 'Nothing posts it; post it by hand, then call record_publication with its link.';
const movedOnAlready = 'Your review is kept, but the piece had moved on already, so it stays where it is.';

/** Sends a drafted piece to the organisation to be approved. */
export async function sendContentForApproval(caller: McpCaller, input: Input, organisation: Organisation) {
	const refusal = await takeMove(pieceAsked(caller, input, organisation), { rule: ContentMoves.sendForApproval });
	if (refusal !== null) return `The piece was not sent for approval: ${refusal}`;
	return sentForApproval;
}

/** Gives an approved piece the date and time it goes out. Nothing posts it: that stays by hand. */
export async function scheduleContent(caller: McpCaller, input: Input, organisation: Organisation) {
	const check = checkScheduledFor(input.scheduledFor);
	if ('problem' in check) return `The piece was not scheduled: ${check.problem}. ${nothingChanged}`;
	const { scheduledFor } = check;
	const refusal = await takeMove(pieceAsked(caller, input, organisation), { rule: ContentMoves.schedule, scheduledFor });
	if (refusal !== null) return `The piece was not scheduled: ${refusal}`;
	return `Scheduled for ${scheduledFor}: the piece is at scheduled. ${postByHand}`;
}

/** Records that a piece went out, with the public link to it. */
export async function recordPublication(caller: McpCaller, input: Input, organisation: Organisation) {
	const check = checkPublishedUrl(input.publishedUrl);
	if ('problem' in check) return `The piece was not recorded as published: ${check.problem}. ${nothingChanged}`;
	const { publishedUrl } = check;
	const move = { rule: ContentMoves.recordPublication, publishedUrl };
	const refusal = await takeMove(pieceAsked(caller, input, organisation), move);
	if (refusal !== null) return `The piece was not recorded as published: ${refusal}`;
	return `Recorded as published at ${publishedUrl}: the piece is at published.`;
}

/** Keeps a person's review of a piece; an approval or a change asked for moves the piece as well. */
export async function reviewContent(caller: McpCaller, input: Input, organisation: Organisation) {
	const check = checkContentReview(input);
	if ('problem' in check) return `The review was not kept: ${check.problem}. Nothing was kept.`;
	const { review } = check;
	const asked = pieceAsked(caller, input, organisation);
	const stage = await stageOf(asked);
	if (stage === null) return noSuchPiece;
	const rule = moveAfterVerdict[review.verdict];
	const isRefused = rule !== null && !canTakeMove(rule, stage);
	if (isRefused) return `The review was not kept: ${rule.refusal}, and this one is at ${stage}. Nothing was kept.`;
	const { organisationId, contentPieceId } = asked;
	await keepContentReview(caller.supabase, { organisationId, contentPieceId, authorId: caller.accountId, review });
	if (rule === null) return `Your ${review.verdict} is kept on the piece, which stays at ${stage}.`;
	const hasMoved = await moveContentPiece(caller.supabase, organisationId, contentPieceId, { rule });
	if (!hasMoved) return movedOnAlready;
	return `Your review is kept and the piece is now at ${rule.to}.`;
}
