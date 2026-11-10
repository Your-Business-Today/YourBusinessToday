import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A piece just kept, and who kept it, for the post it starts. */
export type NewPostOfPiece = { organisationId: string; accountId: string; contentPieceId: string };

/**
 * Keeps a new piece as the first channel of a post of its own, under the piece's own id, as migration 0188 copies
 * every piece kept before it. In the moments before that migration has run there is nowhere to keep the post yet,
 * and nothing is lost: the piece reads as a post of its own, and the migration's copy keeps its post when it runs.
 */
export async function keepPostOfPiece(supabase: SupabaseClient, { organisationId, accountId, contentPieceId }: NewPostOfPiece): Promise<void> {
	const post = { id: contentPieceId, organisation_id: organisationId, created_by: accountId };
	const { error: postError } = await supabase.from('brand_content_posts').insert(post);
	if (isSchemaNotYetMigrated(postError)) return;
	if (postError) throw postError;
	const channel = { content_piece_id: contentPieceId, post_id: contentPieceId, organisation_id: organisationId };
	const { error } = await supabase.from('brand_content_post_channels').insert(channel);
	if (error) throw error;
}
