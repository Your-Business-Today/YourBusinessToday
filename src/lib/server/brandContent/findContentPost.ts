import { contentPieceOfRow } from './contentPieceRow';
import { findPostIdsOfPieces } from './findPostIdsOfPieces';
import { postOfItsOwn, type ContentPost } from '$lib/brand/posts/contentPost';
import type { ContentPiece } from '$lib/brand/content/contentPiece';
import type { SupabaseClient } from '@supabase/supabase-js';

const everyColumn = '*';

/** The post a piece is a channel of, with every channel's piece in the order they were added. */
export async function findContentPost(supabase: SupabaseClient, organisationId: string, piece: ContentPiece): Promise<ContentPost> {
	const postIds = await findPostIdsOfPieces(supabase, organisationId, [piece.id]);
	const postId = postIds.get(piece.id);
	if (postId === undefined) return postOfItsOwn(piece);
	const channels = await findPostChannels(supabase, organisationId, postId);
	return { id: postId, channels, isKept: true };
}

async function findPostChannels(supabase: SupabaseClient, organisationId: string, postId: string): Promise<ContentPiece[]> {
	const { data: channelRows, error: channelError } = await supabase
		.from('brand_content_post_channels')
		.select('content_piece_id')
		.eq('organisation_id', organisationId)
		.eq('post_id', postId);
	if (channelError) throw channelError;
	const pieceIds = (channelRows ?? []).map((row) => row.content_piece_id as string);
	const { data, error } = await supabase
		.from('brand_content_pieces')
		.select(everyColumn)
		.eq('organisation_id', organisationId)
		.in('id', pieceIds)
		.order('created_at');
	if (error) throw error;
	return (data ?? []).map((row) => contentPieceOfRow(row as unknown as Record<string, unknown>));
}
