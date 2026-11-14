import { ContentMoves } from '$lib/brand/content/contentMoves';
import { draftColumnsOf, type ContentPieceToKeep } from './keepContentPiece';
import type { SupabaseClient } from '@supabase/supabase-js';

const { redraft } = ContentMoves;

export type PieceToRedraft = ContentPieceToKeep & { contentPieceId: string };

/**
 * Writes a draft over one of the organisation's ideas or drafted pieces, keeping its day and its post, and says whether it did.
 * The stage is checked in the same update, so a piece sent for approval in the meantime is left alone.
 */
export async function keepDraftOnPiece(supabase: SupabaseClient, piece: PieceToRedraft): Promise<boolean> {
	const { data, error } = await supabase
		.from('brand_content_pieces')
		.update({ ...draftColumnsOf(piece), updated_at: new Date().toISOString() })
		.eq('organisation_id', piece.organisationId)
		.eq('id', piece.contentPieceId)
		.in('stage', redraft.from)
		.select('id');
	if (error) throw error;
	return (data ?? []).length > 0;
}
