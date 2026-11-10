import { findPostPictures } from './findPostPictures';
import { noPictures } from '$lib/brand/pictures/postPictures';
import { postPicturesPageOf, type PostPicturesPage } from '$lib/brand/projections/postPicturesPage';
import { signLibraryViewLinks } from '$lib/server/brandLibrary/signLibraryViewLinks';
import type { SupabaseClient } from '@supabase/supabase-js';

/** What a post says of its picture, as the page of any of its channels shows it, each chosen item viewed through a signed link. */
export async function readPostPicturesPage(supabase: SupabaseClient, organisationId: string, postId: string): Promise<PostPicturesPage> {
	const found = await findPostPictures(supabase, organisationId, [postId]);
	const pictures = found.get(postId) ?? noPictures;
	const signed = await signLibraryViewLinks(supabase, pictures.chosen);
	return postPicturesPageOf(pictures, signed);
}
