import { contentPieceOfRow } from './contentPieceRow';
import type { ContentPiece, ContentReview } from '$lib/brand/content/contentPiece';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ContentPieceWithReviews = { piece: ContentPiece; reviews: ContentReview[] };

const everyColumn = '*';

/**
 * One piece of the organisation's brand content in full, with every review, or null when it holds none of that id.
 * Every column is read, so the piece still reads in the moments before a new column's migration has run.
 */
export async function findContentPiece(
	supabase: SupabaseClient,
	organisationId: string,
	contentPieceId: string
): Promise<ContentPieceWithReviews | null> {
	const { data, error } = await supabase
		.from('brand_content_pieces')
		.select(everyColumn)
		.eq('organisation_id', organisationId)
		.eq('id', contentPieceId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	const reviews = await findContentReviews(supabase, organisationId, contentPieceId);
	return { piece: contentPieceOfRow(data as unknown as Record<string, unknown>), reviews };
}

async function findContentReviews(supabase: SupabaseClient, organisationId: string, contentPieceId: string) {
	const { data, error } = await supabase
		.from('brand_content_reviews')
		.select('verdict, body, created_at')
		.eq('organisation_id', organisationId)
		.eq('content_piece_id', contentPieceId)
		.order('created_at');
	if (error) throw error;
	return (data ?? []).map((row): ContentReview => ({ verdict: row.verdict, body: row.body, createdAt: row.created_at }));
}
