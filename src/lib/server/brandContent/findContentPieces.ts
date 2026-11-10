import type { ContentStage, ContentSummary } from '$lib/brand/content/contentPiece';
import type { SupabaseClient } from '@supabase/supabase-js';

export const ContentListing = { mostPieces: 200 } as const;

const summaryColumns = 'id, medium_path, title, stage, scheduled_for, updated_at';

/** The organisation's pieces, newest first, or only those at one stage. */
export async function findContentPieces(
	supabase: SupabaseClient,
	organisationId: string,
	stage: ContentStage | null
): Promise<ContentSummary[]> {
	const pieces = supabase.from('brand_content_pieces').select(summaryColumns).eq('organisation_id', organisationId);
	const atStage = stage === null ? pieces : pieces.eq('stage', stage);
	const { data, error } = await atStage.order('updated_at', { ascending: false }).limit(ContentListing.mostPieces);
	if (error) throw error;
	return (data ?? []).map(summaryOf);
}

function summaryOf(row: Record<string, unknown>): ContentSummary {
	return {
		id: row.id as string,
		mediumPath: row.medium_path as string,
		title: row.title as string,
		stage: row.stage as ContentStage,
		scheduledFor: row.scheduled_for as string | null,
		updatedAt: row.updated_at as string
	};
}
