import type { ContentPiece, ContentReview, ContentStage } from '$lib/brand/content/contentPiece';
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
	return { piece: pieceOf(data as unknown as Record<string, unknown>), reviews };
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

function pieceOf(row: Record<string, unknown>): ContentPiece {
	return {
		id: row.id as string,
		mediumPath: row.medium_path as string,
		title: row.title as string,
		hook: row.hook as string,
		script: row.script as string,
		storyboard: row.storyboard as ContentPiece['storyboard'],
		caption: row.caption as string,
		invitedAction: row.invited_action as string,
		stage: row.stage as ContentStage,
		brandSnapshot: row.brand_snapshot as ContentPiece['brandSnapshot'],
		scheduledFor: row.scheduled_for as string | null,
		plannedFor: (row.planned_for as string | null | undefined) ?? null,
		publishedUrl: row.published_url as string,
		updatedAt: row.updated_at as string
	};
}
