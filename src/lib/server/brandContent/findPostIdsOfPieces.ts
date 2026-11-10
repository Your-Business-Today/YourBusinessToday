import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * The post each of the organisation's pieces is a channel of, by piece id. A piece on no post is left out, and so is
 * every piece in the moments before the posts' migration has run, so each reads as a post of its own.
 */
export async function findPostIdsOfPieces(
	supabase: SupabaseClient,
	organisationId: string,
	contentPieceIds: string[]
): Promise<Map<string, string>> {
	if (contentPieceIds.length === 0) return new Map();
	const { data, error } = await supabase
		.from('brand_content_post_channels')
		.select('content_piece_id, post_id')
		.eq('organisation_id', organisationId)
		.in('content_piece_id', contentPieceIds);
	if (isSchemaNotYetMigrated(error)) return new Map();
	if (error) throw error;
	return new Map((data ?? []).map((row) => [row.content_piece_id as string, row.post_id as string]));
}
