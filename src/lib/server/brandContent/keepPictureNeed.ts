import { keepPostOfPiece } from './keepPostOfPiece';
import type { ContentPost } from '$lib/brand/posts/contentPost';
import type { PictureNeed } from '$lib/brand/pictures/checkPictureNeed';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A post, who is saying what picture it needs, and the need itself. */
export type PictureNeedToKeep = { organisationId: string; accountId: string; post: ContentPost; need: PictureNeed };

/** Keeps what picture a post needs and where it is expected from, said once for every channel of the post. */
export async function keepPictureNeed(supabase: SupabaseClient, { organisationId, accountId, post, need }: PictureNeedToKeep): Promise<void> {
	if (!post.isKept) await keepPostOfPiece(supabase, { organisationId, accountId, contentPieceId: post.id });
	const { error } = await supabase
		.from('brand_content_posts')
		.update({ picture_needed: need.needed, picture_expected_from: need.expectedFrom })
		.eq('organisation_id', organisationId)
		.eq('id', post.id);
	if (error) throw error;
}
