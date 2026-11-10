import { isSchemaNotYetMigrated } from '$lib/server/schema/schemaNotYetMigrated';
import { libraryItemColumns, parseLibraryItem } from '$lib/server/brandLibrary/libraryItemRecord';
import { noPictures, type PostPictures } from '$lib/brand/pictures/postPictures';
import type { LibraryItem } from '$lib/brand/library/libraryItem';
import type { SupabaseClient } from '@supabase/supabase-js';

type PictureLink = { postId: string; libraryItemId: string };
type PictureNeedRow = { id: string; needed: string | null; expectedFrom: string | null };

/**
 * What each of the posts says of its picture, and the library items chosen for it in the order they were chosen, by post
 * id. A post nobody has said anything of is left out, and so is every post in the moments before the pictures' migration
 * has run, so each reads as one with nothing said.
 */
export async function findPostPictures(supabase: SupabaseClient, organisationId: string, postIds: string[]): Promise<Map<string, PostPictures>> {
	if (postIds.length === 0) return new Map();
	const [needs, links] = await Promise.all([
		findPictureNeeds(supabase, organisationId, postIds),
		findPictureLinks(supabase, organisationId, postIds)
	]);
	const items = await findChosenItems(supabase, organisationId, links);
	const pictures = new Map<string, PostPictures>();
	for (const need of needs) pictures.set(need.id, { ...noPictures, needed: need.needed, expectedFrom: need.expectedFrom, chosen: [] });
	for (const link of links) addChosen(pictures, link, items.get(link.libraryItemId));
	return pictures;
}

function addChosen(pictures: Map<string, PostPictures>, { postId }: PictureLink, item: LibraryItem | undefined): void {
	if (item === undefined) return;
	const post = pictures.get(postId) ?? { ...noPictures, chosen: [] };
	post.chosen.push(item);
	pictures.set(postId, post);
}

async function findPictureNeeds(supabase: SupabaseClient, organisationId: string, postIds: string[]): Promise<PictureNeedRow[]> {
	const { data, error } = await supabase
		.from('brand_content_posts')
		.select('id, picture_needed, picture_expected_from')
		.eq('organisation_id', organisationId)
		.in('id', postIds)
		.not('picture_needed', 'is', null);
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return (data ?? []).map((row) => ({
		id: row.id as string,
		needed: row.picture_needed as string | null,
		expectedFrom: row.picture_expected_from as string | null
	}));
}

async function findPictureLinks(supabase: SupabaseClient, organisationId: string, postIds: string[]): Promise<PictureLink[]> {
	const { data, error } = await supabase
		.from('brand_content_post_pictures')
		.select('post_id, library_item_id')
		.eq('organisation_id', organisationId)
		.in('post_id', postIds)
		.order('chosen_at');
	if (isSchemaNotYetMigrated(error)) return [];
	if (error) throw error;
	return (data ?? []).map((row) => ({ postId: row.post_id as string, libraryItemId: row.library_item_id as string }));
}

async function findChosenItems(supabase: SupabaseClient, organisationId: string, links: PictureLink[]): Promise<Map<string, LibraryItem>> {
	if (links.length === 0) return new Map();
	const itemIds = [...new Set(links.map((link) => link.libraryItemId))];
	const { data, error } = await supabase
		.from('brand_library_items')
		.select(libraryItemColumns)
		.eq('organisation_id', organisationId)
		.in('id', itemIds);
	if (error) throw error;
	const items = (data ?? []).map((row) => parseLibraryItem(row as unknown as Record<string, unknown>));
	return new Map(items.map((item) => [item.id, item]));
}
