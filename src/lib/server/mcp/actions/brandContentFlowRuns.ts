import { checkPublishedUrl } from '$lib/server/brandContent/checkPublishedUrl';
import { checkScheduledFor } from '$lib/brand/content/checkScheduledFor';
import { contentReviewAnswers } from './brandContentReviewAnswers';
import { ContentMoves } from '$lib/brand/content/contentMoves';
import { nothingChanged, pieceAsked, takeMove } from './brandContentPieceMoves';
import { reviewContentPiece } from '$lib/server/brandContent/reviewContentPiece';
import { wordsForOutcome } from '$lib/brand/content/contentReviewOutcome';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

type Input = Record<string, unknown>;

const sentForApproval =
	'Sent for approval: the piece is at awaiting_approval. Anyone on the organisation with Brand ' +
	'approves it, or asks for changes, with review_content.';
const postByHand = 'Nothing posts it; post it by hand, then call record_publication with its link.';

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
	const reviewer = { ...pieceAsked(caller, input, organisation), authorId: caller.accountId };
	const outcome = await reviewContentPiece(caller.supabase, reviewer, input);
	return wordsForOutcome(contentReviewAnswers, outcome);
}
