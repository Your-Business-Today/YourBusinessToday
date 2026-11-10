import type { ContentStage } from '$lib/brand/content/contentPiece';
import type { SupabaseClient } from '@supabase/supabase-js';

/** Where one of the organisation's pieces stands now, or null when it holds none of that id. */
export async function findContentPieceStage(
	supabase: SupabaseClient,
	organisationId: string,
	contentPieceId: string
): Promise<ContentStage | null> {
	const { data, error } = await supabase
		.from('brand_content_pieces')
		.select('stage')
		.eq('organisation_id', organisationId)
		.eq('id', contentPieceId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return data.stage as ContentStage;
}
