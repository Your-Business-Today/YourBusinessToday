import { findContentPieceStage } from '$lib/server/brandContent/findContentPieceStage';
import { isUuid } from '$lib/data/isUuid';
import { moveContentPiece } from '$lib/server/brandContent/moveContentPiece';
import { noSuchPiece } from './brandContentAnswers';
import { readText } from '../actionTypes';
import type { ContentMove } from '$lib/brand/content/contentMoves';
import type { McpCaller } from '../resolveMcpCaller';
import type { Organisation } from '$lib/server/organisations/organisationRecord';

/** The piece an action is asked about: who asks, on which organisation, and its id. */
export type PieceAsked = { caller: McpCaller; organisationId: string; contentPieceId: string };

export const nothingChanged = 'Nothing was changed.';

export function pieceAsked(caller: McpCaller, input: Record<string, unknown>, organisation: Organisation): PieceAsked {
	return { caller, organisationId: organisation.id, contentPieceId: readText(input, 'contentPieceId') };
}

/** Moves the piece by the step, or says why it cannot take it from where it stands. */
export async function takeMove(asked: PieceAsked, move: ContentMove): Promise<string | null> {
	if (!isUuid(asked.contentPieceId)) return noSuchPiece;
	const { caller, organisationId, contentPieceId } = asked;
	const hasMoved = await moveContentPiece(caller.supabase, organisationId, contentPieceId, move);
	if (hasMoved) return null;
	const stage = await stageOf(asked);
	if (stage === null) return noSuchPiece;
	const { refusal } = move.rule;
	return `${refusal}, and this one is at ${stage}. ${nothingChanged}`;
}

/** Where the piece stands now, or null when the brand holds no piece of that id. */
export async function stageOf(asked: PieceAsked) {
	const { caller, organisationId, contentPieceId } = asked;
	if (!isUuid(contentPieceId)) return null;
	return findContentPieceStage(caller.supabase, organisationId, contentPieceId);
}
