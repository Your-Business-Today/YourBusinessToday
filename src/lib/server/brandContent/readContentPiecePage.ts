import { contentPiecePageOf, type ContentPiecePage } from '$lib/brand/projections/contentPiecePage';
import { findContentPiece } from './findContentPiece';
import { isUuid } from '$lib/data/isUuid';
import type { SupabaseClient } from '@supabase/supabase-js';

/** One of the organisation's pieces as its page shows it, or null when the brand holds no piece of that id. */
export async function readContentPiecePage(
	supabase: SupabaseClient,
	organisationId: string,
	contentPieceId: string
): Promise<ContentPiecePage | null> {
	if (!isUuid(contentPieceId)) return null;
	const found = await findContentPiece(supabase, organisationId, contentPieceId);
	if (found === null) return null;
	return contentPiecePageOf(found.piece, found.reviews);
}
