import { ContentMoves } from '$lib/brand/content/contentMoves';
import { draftColumnsOf, type ContentPieceToKeep } from './keepContentPiece';
import type { SupabaseClient } from '@supabase/supabase-js';

const { writeUpIdea } = ContentMoves;

export type IdeaToWriteUp = ContentPieceToKeep & { contentPieceId: string };

/**
 * Writes a draft onto one of the organisation's ideas, keeping the day it is planned for, and says whether it did.
 * The stage is checked in the same update, so only a piece still at idea is written up.
 */
export async function keepDraftOnIdea(supabase: SupabaseClient, idea: IdeaToWriteUp): Promise<boolean> {
	const { data, error } = await supabase
		.from('brand_content_pieces')
		.update({ ...draftColumnsOf(idea), updated_at: new Date().toISOString() })
		.eq('organisation_id', idea.organisationId)
		.eq('id', idea.contentPieceId)
		.in('stage', writeUpIdea.from)
		.select('id');
	if (error) throw error;
	return (data ?? []).length > 0;
}
