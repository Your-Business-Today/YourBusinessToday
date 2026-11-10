import type { SupabaseClient } from '@supabase/supabase-js';
import { LibraryLimits } from '$lib/brand/library/libraryLimits';
import { libraryItemColumns, parseLibraryItem, parseLibraryUpload } from './libraryItemRecord';
import type { LibraryAdder } from './grantLibraryUpload';
import type { LibraryItem } from '$lib/brand/library/libraryItem';

/** The brand's kept photos and videos, latest first, and how many it keeps in all. */
export type KeptLibrary = { items: LibraryItem[]; keptCount: number };

const lastListedRow = LibraryLimits.mostItemsListed - 1;

/** The brand's item with that id, if its upload was granted to this person, whether or not the file has arrived. */
export async function findSentLibraryUpload(supabase: SupabaseClient, adder: LibraryAdder, itemId: string) {
	const { data, error } = await supabase
		.from('brand_library_items')
		.select('id, filename, storage_path, expires_at, recorded_at')
		.eq('id', itemId)
		.eq('organisation_id', adder.organisationId)
		.eq('added_by', adder.accountId)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseLibraryUpload(data);
}

/** The brand's photo or video with that id once its file has arrived; one still awaited is not kept yet. */
export async function findKeptLibraryItem(supabase: SupabaseClient, organisationId: string, itemId: string): Promise<LibraryItem | null> {
	const { data, error } = await supabase
		.from('brand_library_items')
		.select(libraryItemColumns)
		.eq('id', itemId)
		.eq('organisation_id', organisationId)
		.not('recorded_at', 'is', null)
		.maybeSingle();
	if (error) throw error;
	if (data === null) return null;
	return parseLibraryItem(data);
}

/** The brand's kept photos and videos, the latest added first, as many as a list shows. */
export async function readKeptLibrary(supabase: SupabaseClient, organisationId: string): Promise<KeptLibrary> {
	const { data, error, count } = await supabase
		.from('brand_library_items')
		.select(libraryItemColumns, { count: 'exact' })
		.eq('organisation_id', organisationId)
		.not('recorded_at', 'is', null)
		.order('recorded_at', { ascending: false })
		.range(0, lastListedRow);
	if (error) throw error;
	const items = (data ?? []).map(parseLibraryItem);
	return { items, keptCount: count ?? items.length };
}
