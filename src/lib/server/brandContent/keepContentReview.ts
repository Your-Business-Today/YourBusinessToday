import type { ContentReviewToKeep } from '$lib/brand/content/contentReview';
import type { SupabaseClient } from '@supabase/supabase-js';

export type ContentReviewOfPiece = {
	organisationId: string;
	contentPieceId: string;
	authorId: string;
	review: ContentReviewToKeep;
};

/** Keeps what a person said of one of the organisation's pieces. */
export async function keepContentReview(supabase: SupabaseClient, given: ContentReviewOfPiece): Promise<void> {
	const { verdict, body } = given.review;
	const { error } = await supabase.from('brand_content_reviews').insert({
		organisation_id: given.organisationId,
		content_piece_id: given.contentPieceId,
		author_id: given.authorId,
		verdict,
		body
	});
	if (error) throw error;
}
