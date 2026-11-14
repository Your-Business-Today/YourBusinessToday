import { libraryItemColumns, parseLibraryItem } from './libraryItemRecord';
import { signLibraryViewLinks, type ViewableLibraryItem } from './signLibraryViewLinks';
import type { FilmFile } from '$lib/brand/film/storyboardFilm';
import type { SupabaseClient } from '@supabase/supabase-js';

/** The brand's kept items of those ids, each with a short-lived link; one storage cannot sign is left out. */
export async function readSignedLibraryItems(supabase: SupabaseClient, organisationId: string, itemIds: string[]): Promise<ViewableLibraryItem[]> {
	if (itemIds.length === 0) return [];
	const { data, error } = await supabase
		.from('brand_library_items')
		.select(libraryItemColumns)
		.eq('organisation_id', organisationId)
		.in('id', itemIds)
		.not('recorded_at', 'is', null);
	if (error) throw error;
	const signed = await signLibraryViewLinks(supabase, (data ?? []).map(parseLibraryItem));
	return signed.filter((item) => item.viewUrl !== null);
}

/** The brand's kept files of those ids, each by a short-lived link, by id; one not kept or not signed is left out. */
export async function readFilmFiles(supabase: SupabaseClient, organisationId: string, itemIds: string[]): Promise<Map<string, FilmFile>> {
	const reachable = await readSignedLibraryItems(supabase, organisationId, itemIds);
	return new Map(reachable.map((item) => [item.id, { url: item.viewUrl as string, mimeType: item.mimeType }]));
}
