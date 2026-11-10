import { ChoosingOutcomes, type ChoosingOutcome } from '$lib/brand/pictures/postPictures';
import { keepPostOfPiece } from './keepPostOfPiece';
import type { ContentPost } from '$lib/brand/posts/contentPost';
import type { SupabaseClient } from '@supabase/supabase-js';

/** A post, who is choosing a picture for it, and the library item chosen. */
export type PostPictureToKeep = { organisationId: string; accountId: string; post: ContentPost; libraryItemId: string };

const uniqueViolation = '23505';

/** Keeps a library item as one of a post's pictures, with who chose it; an item already on the post is not kept again. */
export async function keepPostPicture(supabase: SupabaseClient, picture: PostPictureToKeep): Promise<ChoosingOutcome> {
	const { organisationId, accountId, post, libraryItemId } = picture;
	if (!post.isKept) await keepPostOfPiece(supabase, { organisationId, accountId, contentPieceId: post.id });
	const link = { post_id: post.id, organisation_id: organisationId, library_item_id: libraryItemId, chosen_by: accountId };
	const { error } = await supabase.from('brand_content_post_pictures').insert(link);
	if (error?.code === uniqueViolation) return ChoosingOutcomes.alreadyChosen;
	if (error) throw error;
	return ChoosingOutcomes.chosen;
}
