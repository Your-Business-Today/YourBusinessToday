import { awaitingPieceRowOf, type AwaitingPieceRow } from '$lib/brand/projections/contentPiecePage';
import { ContentStages } from '$lib/brand/content/contentPiece';
import { findContentPieces } from './findContentPieces';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The organisation's pieces waiting for someone on it to approve them or ask for a change, newest first. */
export async function readPiecesAwaitingApproval(supabase: SupabaseClient, organisationId: string): Promise<AwaitingPieceRow[]> {
	const pieces = await findContentPieces(supabase, organisationId, ContentStages.awaitingApproval);
	return pieces.map(awaitingPieceRowOf);
}
