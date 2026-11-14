import { canTakeMove, ContentMoves } from '$lib/brand/content/contentMoves';
import { checkDraftFor } from './brandContentDraftChecks';
import { checkPostKindIfGiven } from '$lib/brand/postKinds/checkPostKind';
import { ContentStages, type ContentPiece, type ContentStage } from '$lib/brand/content/contentPiece';
import { draftOverPiece, problemWithMediumChange } from '$lib/brand/content/draftOverPiece';
import { findContentPiece } from '$lib/server/brandContent/findContentPiece';
import { isUuid } from '$lib/data/isUuid';
import { keepDraftOnPiece } from '$lib/server/brandContent/keepDraftOnPiece';
import { nothingChanged, stageOf } from './brandContentPieceMoves';
import { noSuchPiece } from './brandContentAnswers';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

const { redraft } = ContentMoves;

/** Drafts an idea or a drafted piece again over what it keeps, on its own day and post, or says why it cannot. */
export async function redraftContent(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation, contentPieceId: string) {
	if (!isUuid(contentPieceId)) return noSuchPiece;
	const found = await findContentPiece(caller.supabase, organisation.id, contentPieceId);
	if (found === null) return noSuchPiece;
	const { piece } = found;
	if (!canTakeMove(redraft, piece.stage)) return refusalAt(piece.stage);
	const mediumProblem = problemWithMediumChange(piece, input);
	if (mediumProblem !== null) return `The piece was not drafted: ${mediumProblem}. ${nothingChanged}`;
	const checked = await checkDraftFor(caller, draftOverPiece(piece, input), organisation, checkPostKindIfGiven);
	if ('refusal' in checked) return checked.refusal;
	const { draft } = checked.piece;
	const isKept = await keepDraftOnPiece(caller.supabase, { ...checked.piece, contentPieceId });
	if (isKept) return redrafted(piece, draft.title);
	const stageNow = await stageOf({ caller, organisationId: organisation.id, contentPieceId });
	if (stageNow === null) return noSuchPiece;
	return refusalAt(stageNow);
}

function redrafted(piece: ContentPiece, title: string): string {
	const isIdea = piece.stage === ContentStages.idea;
	if (isIdea) return `Wrote up the idea as “${title}” (id ${piece.id}). It is at drafted, on its planned day.`;
	return `Changed “${title}” (id ${piece.id}). It is still at drafted, on its day, with the brand as it holds now.`;
}

function refusalAt(stage: ContentStage): string {
	const isAwaitingApproval = stage === ContentStages.awaitingApproval;
	const wayRound = isAwaitingApproval
		? 'Ask for changes with review_content, which sends it back to drafted, then draft it again.'
		: 'Once approved a piece is not changed; draft a new piece instead.';
	return `${redraft.refusal}, and this one is at ${stage}. ${wayRound} ${nothingChanged}`;
}
